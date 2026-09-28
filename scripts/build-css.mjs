import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

// Baut src/lib.css (Tokens + die in src/ benutzten Tailwind-Utilities) und
// stellt das Ergebnis dem CSS voran, das tsup pro Entry-Point (core, formik)
// aus den CSS-Modules erzeugt hat. Das Ergebnis ist dist/index.css — ein
// eigenstaendiges Bundle mit Tokens + allen Komponentenstilen, egal ob der
// Konsument core.js oder formik.js importiert.
//
// Warum getrennt von tsup: tsup zwingt esbuild denselben CSS-Loader fuer ALLE
// .css-Dateien auf. Wir brauchen "local-css" fuer die *.module.css — das wuerde
// aber auch die globalen Tailwind-Utilities umbenennen (.absolute -> .lib_absolute),
// womit jede Klasse im JSX ins Leere greifen wuerde.
//
// tsup hat keinen "index"-Entry mehr (nur "core" und "formik"), erzeugt also
// core.css und formik.css statt index.css. Beide muessen hier zusammen mit
// den globalen Tokens in dist/index.css gemergt werden, sonst fehlen z.B.
// die TextField-Styles aus formik.css komplett im veroeffentlichten Bundle.
//
// formik importiert die Kernkomponenten per Plugin extern aus jaklib/core
// (siehe tsup.config.ts) und erzeugt daher meist gar keine eigene formik.css.
// Existiert sie doch, wird sie einfach mit angehaengt; scripts/verify-css.mjs
// prueft anschliessend, dass jede vom JS verwendete Klasse im Bundle liegt.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "src", "lib.css");
const out = path.join(root, "dist", "index.css");

const source = await fs.readFile(entry, "utf8");
const { css: globalCss } = await postcss([tailwind()]).process(source, {
  from: entry,
  to: out,
});

// Global statt nur am Dateiende: ein einziger uebrig gebliebener Kommentar
// mitten im gemergten Bundle laesst Consumer-Parser (Turbopack/lightningcss)
// mit "Invalid empty selector" abbrechen. Das Tailwind-Banner steckt ebenfalls
// in den tsup-Ausgaben und wuerde sonst pro Entry doppelt im Bundle landen.
const stripSourceMapComment = (css) =>
  css
    .replace(/\/\*# sourceMappingURL=[^*]*\*\//g, "")
    .replace(/\/\*! tailwindcss [^*]*\*\//g, "");

// Jede der beiden Entry-CSS-Dateien existiert nur, wenn der jeweilige Entry
// ueberhaupt CSS-Module importiert.
const moduleCssParts = [];
for (const entryName of ["core", "formik"]) {
  const file = path.join(root, "dist", `${entryName}.css`);
  try {
    const css = await fs.readFile(file, "utf8");
    moduleCssParts.push(stripSourceMapComment(css).trim());
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

// In @layer components statt unlayered ausliefern: Tailwinds eigene
// Layer-Reihenfolge ist theme < base < components < utilities. Landen
// Komponentenstile unlayered, schlagen sie *jede* Utility-Klasse des
// Konsumenten (unlayered > jede Layer, unabhängig von Spezifitaet/
// Ladereihenfolge) — genau das Problem, das className-Overrides wie
// `min-h-0` sonst wirkungslos macht.
const moduleCss = moduleCssParts.length
  ? `@layer components {\n${moduleCssParts.join("\n\n")}\n}\n`
  : "";

await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, `${globalCss.trimEnd()}\n\n${moduleCss}`);

const { size } = await fs.stat(out);
console.log(`CSS   dist/index.css  ${(size / 1024).toFixed(2)} KB`);
