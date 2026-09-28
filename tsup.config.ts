import type { Plugin } from "esbuild";
import { defineConfig } from "tsup";

// Die Formik-Wrapper importieren die Kernkomponenten über "@/components".
// Würde esbuild sie einbündeln, entstünde in formik.js eine zweite Kopie samt
// eigener CSS-Modul-Klassen (TextField_base2 ...), deren Namen je Format
// (ESM/CJS) unterschiedlich ausfallen und nie zum gemergten dist/index.css
// passen. Stattdessen zeigt der Import auf das veröffentlichte jaklib/core:
// eine Komponenteninstanz, eine Klassenvergabe.
const coreAsExternal: Plugin = {
  name: "core-as-external",
  setup(build) {
    build.onResolve({ filter: /^@\/components$/ }, () => ({
      path: "jaklib/core",
      external: true,
    }));
  },
};

export default defineConfig({
  entry: {
    core: "src/components/index.ts",
    formik: "src/formik/index.ts",
  },
  format: ["esm", "cjs"],
  dts: { compilerOptions: { incremental: false, composite: false } },
  sourcemap: true,
  clean: true,
  outDir: "dist",
  // next/* nur wegen Avatar (next/image) — sonst würde esbuild next.js
  // komplett mit einbündeln, inkl. CommonJS-require()-Aufrufen, die
  // Turbopack im Client-Modulgraph ablehnt ("dynamic usage of require").
  // formik ist eine peerDependency von jaklib/formik — nicht mitbündeln,
  // sonst bekäme der Consumer zwei Formik-Instanzen (eigene + gebündelte).
  external: ["react", "react-dom", "next", "next/*", "formik"],
  injectStyle: false,
  esbuildPlugins: [coreAsExternal],
  loader: { ".css": "local-css" },
  banner: { js: '"use client";' },
});
