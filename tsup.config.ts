import { defineConfig } from "tsup";

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
  loader: { ".css": "local-css" },
  banner: { js: '"use client";' },
});
