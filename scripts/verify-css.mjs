import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

// Prueft dist/index.css nach dem Build. Die Datei ist ein zusammengesetztes
// Artefakt (Tailwind + CSS-Module aus core/formik) und ging schon kaputt, ohne
// dass es hier aufgefallen waere — erst der Consumer-Build hat es gemeldet.
// Jede Pruefung steht fuer einen tatsaechlich aufgetretenen Fehler.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const errors = [];
const fail = (message) => errors.push(message);

const read = (file) => fs.readFile(path.join(dist, file), "utf8");

// Klassennamen aus den tsup-Ausgaben (vor dem Merge), z.B. .Card_base, .TextField_base2
async function classesOf(cssFile) {
  const root = postcss.parse(await read(cssFile));
  const names = new Set();
  root.walkRules((rule) => {
    for (const match of rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
      names.add(match[1]);
    }
  });
  return names;
}

const indexCss = await read("index.css");

// 1. Parst ohne Fehler (Turbopack/lightningcss brechen sonst beim Consumer ab).
let parsed;
try {
  parsed = postcss.parse(indexCss);
} catch (error) {
  fail(`index.css laesst sich nicht parsen: ${error.message}`);
}

// 2. Keine Reste aus den Zwischenprodukten.
if (/sourceMappingURL/.test(indexCss)) {
  fail("index.css enthaelt einen sourceMappingURL-Kommentar.");
}
const banners = indexCss.match(/\/\*! tailwindcss /g) ?? [];
if (banners.length !== 1) {
  fail(`Tailwind-Banner ${banners.length}x statt 1x (Zwischenprodukt nicht gestrippt?).`);
}

if (parsed) {
  // 3. Komponentenstile liegen in @layer components, nicht unlayered.
  //    Unlayered schlaegt jede Utility-Klasse des Consumers (className-Overrides tot).
  const layered = new Set();
  const unlayered = new Set();
  parsed.walkRules((rule) => {
    const inComponents = (function inLayer(node) {
      for (let p = node.parent; p; p = p.parent) {
        if (p.type === "atrule" && p.name === "layer" && p.params === "components") return true;
      }
      return false;
    })(rule);
    for (const match of rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
      (inComponents ? layered : unlayered).add(match[1]);
    }
  });

  // esbuild benennt auch @keyframes lokal um (Dropdown_slideDown); das JS
  // referenziert sie wie Klassen.
  const keyframes = new Set();
  parsed.walkAtRules("keyframes", (rule) => keyframes.add(rule.params));

  // 4. Jede Klasse aus core.css/formik.css ist im Bundle und liegt im Layer.
  const expected = new Set();
  for (const file of ["core.css", "formik.css"]) {
    try {
      for (const name of await classesOf(file)) expected.add(name);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  if (expected.size === 0) fail("Keine Modul-Klassen in core.css/formik.css gefunden.");
  for (const name of expected) {
    if (!layered.has(name)) {
      fail(
        unlayered.has(name)
          ? `.${name} liegt unlayered statt in @layer components.`
          : `.${name} fehlt in index.css.`,
      );
    }
  }

  // 5. Jede Modul-Klasse, die das kompilierte JS verwendet, existiert im CSS.
  //    esbuild vergibt Namen wie TextField_base2 je Entry — stimmen JS und CSS
  //    nicht ueberein, sind die Felder ungestylt.
  const jsFiles = (await fs.readdir(dist)).filter((f) => /\.(mjs|js)$/.test(f));
  for (const file of jsFiles) {
    const js = await read(file);
    for (const match of js.matchAll(/["']([A-Z][A-Za-z]*_[A-Za-z]+\d*)["']/g)) {
      if (!layered.has(match[1]) && !keyframes.has(match[1])) {
        fail(`${file} verwendet "${match[1]}", das in index.css fehlt.`);
      }
    }
  }

  // 6. Die Token-Basis ist da.
  for (const token of ["--primary", "--surface", "--border"]) {
    if (!indexCss.includes(`${token}:`)) fail(`Token ${token} fehlt in index.css.`);
  }
}

if (errors.length > 0) {
  console.error("\n\x1b[31m✘ dist/index.css ist fehlerhaft:\x1b[0m");
  for (const message of [...new Set(errors)]) {
    console.error(`  - ${message}`);
    // Workflow-Annotation: erscheint direkt in der GitHub-Oberfläche.
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::error title=dist/index.css fehlerhaft::${message}`);
    }
  }
  process.exit(1);
}
console.log("CSS   dist/index.css verifiziert");
