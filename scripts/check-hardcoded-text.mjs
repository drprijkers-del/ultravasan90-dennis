// Advisory scan for user-facing text hard-coded in components instead of routed
// through t(). This is the gap the i18n JSON check cannot see: a Dutch string
// baked into JSX renders untranslated when the locale switches.
//
// Heuristic and intentionally NOT wired into the build — JSX text detection has
// false positives (proper nouns, units), so blocking on it would break builds
// for non-issues. Run it manually (npm run check-hardcoded) after adding UI.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

// Files intentionally exempt: the hidden /race tab (unlinked, translated later)
// and metadata that doesn't switch with the locale toggle.
const EXEMPT = [/\/components\/race\//, /\/app\/race\//, /\/app\/layout\.tsx$/];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return p.endsWith(".tsx") ? [p] : [];
  });
}

// A run of two+ letters is "words"; three+ letters looks like real prose.
const WORDS = /[A-Za-zÀ-ÿ]{3,}/;
// JSX text node: > text < with letters, not an expression {..} and not a tag.
const JSX_TEXT = />\s*([A-Za-zÀ-ÿ][^<>{}]*[A-Za-zÀ-ÿ])\s*</g;

const findings = [];
for (const file of walk(root)) {
  if (EXEMPT.some((re) => re.test(file))) continue;
  const rel = path.relative(path.join(root, ".."), file);
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|import|export type|\/\*)/.test(line)) return;
    let m;
    JSX_TEXT.lastIndex = 0;
    while ((m = JSX_TEXT.exec(line))) {
      const text = m[1].trim();
      if (!WORDS.test(text)) continue;
      // Skip fragments that are clearly not prose.
      if (/^[A-Z]{1,4}$|^\d|^&[a-z]+;$/.test(text)) continue;
      findings.push(`${rel}:${i + 1}  “${text}”`);
    }
  });
}

if (findings.length) {
  console.log(`\nPossible hard-coded UI text (${findings.length}) — route through t() if user-facing:\n`);
  findings.forEach((f) => console.log("  " + f));
  console.log("\n(Advisory only. Proper nouns / units are false positives.)\n");
} else {
  console.log("No hard-coded UI text found outside exempt paths.");
}
