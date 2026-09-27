import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: { compilerOptions: { incremental: false, composite: false } },
  sourcemap: true,
  clean: true,
  outDir: "dist",
  external: ["react", "react-dom"],
  injectStyle: false,
  loader: { ".css": "local-css" },
  banner: { js: '"use client";' },
});
