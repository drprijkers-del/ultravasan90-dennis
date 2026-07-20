// Fails the build if the translation files drift apart. Checks that nl.json and
// sv.json have exactly the same set of keys, and flags values left identical
// between languages (a likely untranslated string), excluding known cognates.
//
// Caveat: this only compares the JSON files. It cannot see strings hard-coded in
// components — those bypass i18n entirely and must be routed through t() to be
// covered here.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "messages");
const nl = JSON.parse(fs.readFileSync(path.join(dir, "nl.json"), "utf8"));
const sv = JSON.parse(fs.readFileSync(path.join(dir, "sv.json"), "utf8"));

const flat = (o, p = "") =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? flat(v, p + k + ".")
      : [[p + k, v]]
  );

const N = Object.fromEntries(flat(nl));
const S = Object.fromEntries(flat(sv));
const nk = Object.keys(N);
const sk = Object.keys(S);

const missingInSv = nk.filter((k) => !(k in S));
const missingInNl = sk.filter((k) => !(k in N));

// Cognates that are legitimately identical in both languages.
const ALLOW = new Set([
  "home.title", // "Ultravasan 90" — proper noun
  "home.countdown.min",
  "progress.tempo.date", // "Datum" — same word in Swedish
  "progress.tempo.pace", // "Tempo" — same word in Swedish
  "progress.tempo.status", // "Status" — same word in Swedish
  "common.minPerKm",
  "plan.colKm", // "km"
  "plan.colPace", // "Tempo"
]);
const suspect = nk.filter(
  (k) => k in S && String(N[k]) === String(S[k]) && !ALLOW.has(k) &&
    // ignore pure numbers / units / brand names
    !/^(UV90|Ultravasan|App Store|Google Play|[\d\s.,:%–—-]+)$/.test(String(N[k]))
);

let ok = true;
if (missingInSv.length) {
  ok = false;
  console.error(`\n✖ Keys in nl.json missing from sv.json (${missingInSv.length}):`);
  missingInSv.forEach((k) => console.error("  -", k));
}
if (missingInNl.length) {
  ok = false;
  console.error(`\n✖ Keys in sv.json missing from nl.json (${missingInNl.length}):`);
  missingInNl.forEach((k) => console.error("  -", k));
}
if (suspect.length) {
  ok = false;
  console.error(`\n✖ Identical nl/sv values (likely untranslated, ${suspect.length}):`);
  suspect.forEach((k) => console.error(`  - ${k} = ${JSON.stringify(N[k])}`));
  console.error("\n  If a value is genuinely identical in both languages, add its key to ALLOW in scripts/check-i18n.mjs.");
}

if (!ok) {
  console.error("\ni18n check failed. Fix the keys above before building.\n");
  process.exit(1);
}
console.log(`i18n check passed: ${nk.length} keys, nl and sv in sync.`);
