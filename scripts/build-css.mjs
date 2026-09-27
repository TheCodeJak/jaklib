import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

// Baut src/lib.css (Tokens + die in src/ benutzten Tailwind-Utilities) und
// stellt das Ergebnis dem CSS voran, das tsup aus den CSS-Modules erzeugt hat.
//
// Warum getrennt von tsup: tsup zwingt esbuild denselben CSS-Loader fuer ALLE
// .css-Dateien auf. Wir brauchen "local-css" fuer die *.module.css — das wuerde
// aber auch die globalen Tailwind-Utilities umbenennen (.absolute -> .lib_absolute),
// womit jede Klasse im JSX ins Leere greifen wuerde.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "src", "lib.css");
const out = path.join(root, "dist", "index.css");

const source = await fs.readFile(entry, "utf8");
const { css: globalCss } = await postcss([tailwind()]).process(source, {
  from: entry,
  to: out,
});

// dist/index.css existiert nur, wenn mindestens ein CSS-Module importiert wird.
let moduleCss = "";
try {
  moduleCss = await fs.readFile(out, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

// Die Sourcemap von tsup passt nach dem Voranstellen nicht mehr.
moduleCss = moduleCss.replace(/\/\*# sourceMappingURL=.*?\*\/\s*$/, "");
await fs.rm(path.join(root, "dist", "index.css.map"), { force: true });

await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, `${globalCss.trimEnd()}\n\n${moduleCss.trimStart()}`);

const { size } = await fs.stat(out);
console.log(`CSS   dist/index.css  ${(size / 1024).toFixed(2)} KB`);
