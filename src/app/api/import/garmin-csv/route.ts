import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const maxDuration = 60;

function parseTime(timeStr: string): number {
  if (!timeStr) return 0;
  // Handle Garmin format like "00:57:29" or "00:02:43,6"
  const clean = timeStr.split(",")[0]; // Remove subseconds
  const parts = clean.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function parseDutchNumber(val: string): number {
  if (!val || val === "--") return 0;
  // Dutch locale: "10,54" means 10.54 — dots are thousands, commas are decimal
  // Remove dots used as thousands separator, then replace comma with dot
  const cleaned = val.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function findCol(headers: string[], ...patterns: string[]): number {
  return headers.findIndex((h) =>
    patterns.some((p) => h.includes(p))
  );
}

interface RowData {
  [key: string]: string;
}

function parseCSVToRows(text: string): { headers: string[]; rows: RowData[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headerFields = parseCSVLine(lines[0]);
  const headers = headerFields.map((h) => h.replace(/"/g, "").trim().toLowerCase());
  const headerKeys = headerFields.map((h) => h.replace(/"/g, "").trim());

  const rows: RowData[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 3) continue;
    const row: RowData = {};
    for (let j = 0; j < headerKeys.length && j < fields.length; j++) {
      row[headerKeys[j]] = fields[j].replace(/^"|"$/g, "");
    }
    rows.push(row);
  }
  return { headers, rows };
}

function parseXLSXToRows(buffer: ArrayBuffer): { headers: string[]; rows: RowData[] } {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: 1 }) as unknown[][];

  if (!rawRows.length) return { headers: [], rows: [] };

  // Garmin sometimes packs CSV data into a single XLSX column
  const firstRow = rawRows[0];
  if (firstRow.length === 1 && String(firstRow[0]).includes(",")) {
    // All data is in column A as CSV lines — parse as CSV
    const csvText = rawRows.map((r) => String(r[0] ?? "")).join("\n");
    return parseCSVToRows(csvText);
  }

  // Normal multi-column XLSX
  const headerKeys = firstRow.map((h) => String(h).trim());
  const headers = headerKeys.map((h) => h.toLowerCase());
  const rows: RowData[] = [];
  for (let i = 1; i < rawRows.length; i++) {
    const row: RowData = {};
    for (let j = 0; j < headerKeys.length; j++) {
      row[headerKeys[j]] = rawRows[i][j] == null ? "" : String(rawRows[i][j]);
    }
    rows.push(row);
  }
  return { headers, rows };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isXLSX = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    let headers: string[];
    let rows: RowData[];

    if (isXLSX) {
      const buffer = await file.arrayBuffer();
      ({ headers, rows } = parseXLSXToRows(buffer));
    } else {
      const text = await file.text();
      ({ headers, rows } = parseCSVToRows(text));
    }

    if (!rows.length) {
      return NextResponse.json({ error: "No data rows found" }, { status: 400 });
    }

    const headerKeys = Object.keys(rows[0]);

    // Map columns (Dutch + English Garmin headers)
    const colIdx = {
      type: findCol(headers, "activity type", "activiteittype", "type"),
      date: findCol(headers, "date", "datum"),
      title: findCol(headers, "title", "titel", "name", "naam"),
      distance: findCol(headers, "distance", "afstand"),
      time: findCol(headers, "time", "tijd"),
      avgHr: findCol(headers, "avg hr", "gem. hs", "avg heart", "gemiddelde hartslag", "gem. hartslag"),
      maxHr: findCol(headers, "max hr", "max. hs", "max heart", "maximale hartslag", "max. hartslag"),
      avgSpeed: findCol(headers, "avg speed", "gem. snelheid", "avg pace", "gem. tempo", "gemiddeld tempo"),
      elevGain: findCol(headers, "elev gain", "totale stijging", "elevation gain", "stijging"),
      movingTime: findCol(headers, "moving time", "tijd bewogen", "beweegtijd", "verplaatsingstijd"),
    };

    // First, delete old Garmin imports (negative IDs) to do a clean re-import
    await prisma.activity.deleteMany({
      where: { stravaActivityId: { lt: BigInt(0) } },
    });

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const get = (idx: number) => idx >= 0 ? row[headerKeys[idx]] ?? "" : "";

      const actType = get(colIdx.type);
      const isRun =
        actType.toLowerCase().includes("run") ||
        actType.toLowerCase().includes("hardlopen") ||
        actType.toLowerCase().includes("trail");

      if (!isRun) { skipped++; continue; }

      const dateStr = get(colIdx.date);
      if (!dateStr) { skipped++; continue; }
      const startDate = new Date(dateStr);
      if (isNaN(startDate.getTime())) { skipped++; continue; }

      const title = get(colIdx.title) || "Garmin Run";
      const distanceKm = parseDutchNumber(get(colIdx.distance));
      const distanceM = distanceKm * 1000;

      const timeStr = get(colIdx.movingTime) || get(colIdx.time);
      const movingTimeS = parseTime(timeStr);

      const avgHr = parseDutchNumber(get(colIdx.avgHr));
      const maxHr = parseDutchNumber(get(colIdx.maxHr));
      const elevGain = parseDutchNumber(get(colIdx.elevGain));

      // Pace: Garmin gives "5:27" (min:sec per km)
      let avgSpeed = 0;
      const paceStr = get(colIdx.avgSpeed);
      if (paceStr && paceStr.includes(":")) {
        const paceSec = parseTime(paceStr);
        avgSpeed = paceSec > 0 ? 1000 / paceSec : 0;
      } else if (distanceM > 0 && movingTimeS > 0) {
        avgSpeed = distanceM / movingTimeS;
      }

      const garminId = BigInt(-Math.abs(startDate.getTime()));

      const isLongRun =
        startDate.getDay() === 0 ||
        title.toLowerCase().includes("long") ||
        distanceM >= 15000;

      await prisma.activity.upsert({
        where: { stravaActivityId: garminId },
        create: {
          stravaActivityId: garminId,
          name: title,
          type: "Run",
          startDate,
          distanceM,
          movingTimeS,
          elapsedTimeS: movingTimeS,
          averageSpeed: avgSpeed,
          averageHeartrate: avgHr || null,
          maxHeartrate: maxHr || null,
          totalElevationGain: elevGain,
          summaryPolyline: null,
          isLongRun,
        },
        update: {
          name: title,
          distanceM,
          movingTimeS,
          elapsedTimeS: movingTimeS,
          averageSpeed: avgSpeed,
          averageHeartrate: avgHr || null,
          maxHeartrate: maxHr || null,
          totalElevationGain: elevGain,
          isLongRun,
        },
      });

      imported++;
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${imported} runs, skipped ${skipped} non-run activities`,
      imported,
      skipped,
      detectedHeaders: headers,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Import failed", details: String(error) },
      { status: 500 }
    );
  }
}
