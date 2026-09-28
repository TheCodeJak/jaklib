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
// formik.css ist praktisch immer eine (Teil-)Kopie von core.css: die
// formik-Wrapper importieren die Kern-Komponenten ueber das "@/components"-
// Barrel, wodurch esbuild denselben Modul-CSS-Block noch einmal in formik.css
// emittiert. Ein simples Aneinanderhaengen wuerde also jede Regel doppelt in
// dist/index.css schreiben — Next.js' CSS-Optimierer (Lightning CSS)
// disambiguiert doppelte Selektoren dann mit einem "2"-Suffix
// (.TextField_base -> .TextField_base2), was die Klassen im Consumer bricht.
// Deshalb: pro Quell-Datei-Block (esbuild markiert jeden mit einem
// "/* src/... */"-Kommentar) nur das erste Vorkommen behalten.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "src", "lib.css");
const out = path.join(root, "dist", "index.css");

const source = await fs.readFile(entry, "utf8");
const { css: globalCss } = await postcss([tailwind()]).process(source, {
  from: entry,
  to: out,
});

const stripSourceMapComment = (css) =>
  css.replace(/\/\*# sourceMappingURL=.*?\*\/\s*$/, "");

const sourceBlockHeader = /^\/\* .*\*\/$/;

function dedupeSourceBlocks(cssFiles) {
  const seen = new Set();
  const kept = [];
  for (const css of cssFiles) {
    let current = [];
    const flush = () => {
      if (current.length === 0) return;
      const block = current.join("\n").trim();
      if (block && !seen.has(block)) {
        seen.add(block);
        kept.push(block);
      }
      current = [];
    };
    for (const line of css.split("\n")) {
      if (sourceBlockHeader.test(line) && current.length > 0) flush();
      current.push(line);
    }
    flush();
  }
  return kept.join("\n\n");
}

// Jede der beiden Entry-CSS-Dateien existiert nur, wenn der jeweilige Entry
// ueberhaupt CSS-Module importiert.
const moduleCssFiles = [];
for (const entryName of ["core", "formik"]) {
  const file = path.join(root, "dist", `${entryName}.css`);
  try {
    const css = await fs.readFile(file, "utf8");
    moduleCssFiles.push(stripSourceMapComment(css).trim());
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
const moduleCss = dedupeSourceBlocks(moduleCssFiles);

await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, `${globalCss.trimEnd()}\n\n${moduleCss}\n`);

const { size } = await fs.stat(out);
console.log(`CSS   dist/index.css  ${(size / 1024).toFixed(2)} KB`);
