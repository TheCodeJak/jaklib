import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import { rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Prüft, ob das gepackte jaklib in einem frischen Next-Projekt baut.
// Aufruf: npm run check:consumer [-- --keep]   (--keep behält den Temp-Ordner)
// Bewusst Node statt Bash/PowerShell: läuft unverändert unter Windows und Linux.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const keep = process.argv.includes("--keep");

const red = (text) => `\x1b[31m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;

// Pfade mit Leerzeichen (z. B. C:\Users\Vor Name\...) müssen für die Shell gequotet werden.
const quote = (arg) => (/[\s"]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg);

// Unter Windows sind npm/npx .cmd-Dateien: ohne `shell: true` findet Node sie nicht.
// Die Shell reicht Argumente ungequotet durch, daher werden sie hier selbst gequotet.
function run(command, args, { cwd } = {}) {
  const result = spawnSync(command, args.map(quote), {
    cwd,
    shell: true,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (result.status !== 0) {
    throw new Error(`"${command} ${args.join(" ")}" ist fehlgeschlagen (Exit-Code ${result.status}).`);
  }
}

function step(text) {
  console.log(`\n\x1b[36m▶ ${text}\x1b[0m`);
}

// ---------------------------------------------------------
// Dateien des minimalen Consumer-Projekts
// ---------------------------------------------------------
const files = {
  "package.json": JSON.stringify(
    { name: "jaklib-consumer-check", private: true, version: "0.0.0" },
    null,
    2,
  ),

  "next.config.ts": `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`,

  // Ohne tsconfig würde Next beim Build interaktiv/automatisch eine anlegen.
  "tsconfig.json": JSON.stringify(
    {
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "react-jsx",
        incremental: true,
        plugins: [{ name: "next" }],
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    },
    null,
    2,
  ),

  // CSS genau einmal, hier.
  "app/layout.tsx": `import "jaklib/styles.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
`,

  // Server Component importiert die Lib direkt: prüft, dass das "use client"-Banner greift.
  "app/page.tsx": `import { Button, Card } from "jaklib";
import Counter from "./Counter";

export default function Page() {
  return (
    <Card>
      <Button>Klick</Button>
      <Counter />
    </Card>
  );
}
`,

  // Client Component nutzt Lib-Komponente mit State und Event-Handler.
  "app/Counter.tsx": `"use client";

import { useState } from "react";
import { Button } from "jaklib";

export default function Counter() {
  const [n, setN] = useState(0);
  return <Button onClick={() => setN(n + 1)}>{n}</Button>;
}
`,
};

// ---------------------------------------------------------
// Ablauf
// ---------------------------------------------------------
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "jaklib-check-"));
let failed = false;

try {
  step("Lib bauen (npm run build:lib)");
  run("npm", ["run", "build:lib"], { cwd: root });

  // --ignore-scripts: `prepack` würde sonst build:lib ein zweites Mal ausführen.
  step("Tarball packen (npm pack)");
  const packDir = path.join(tmp, "pack");
  await fs.mkdir(packDir);
  run("npm", ["pack", "--ignore-scripts", "--pack-destination", packDir], { cwd: root });
  // stdio ist "inherit", stdout lässt sich also nicht lesen. Der Ordner war leer,
  // daher ist die einzige .tgz darin der gepackte Tarball.
  const [tarballName] = (await fs.readdir(packDir)).filter((f) => f.endsWith(".tgz"));
  if (!tarballName) throw new Error("npm pack hat keinen Tarball erzeugt.");
  const tarball = path.join(packDir, tarballName);
  console.log(`  ${tarball}`);

  step("Consumer-Projekt schreiben");
  const consumerDir = path.join(tmp, "consumer");
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(consumerDir, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  }
  console.log(`  ${consumerDir}`);

  step("Abhängigkeiten installieren");
  run(
    "npm",
    [
      "install",
      "--no-audit",
      "--no-fund",
      tarball,
      "next",
      "react",
      "react-dom",
      "typescript",
      "@types/react",
      "@types/react-dom",
      "@types/node",
    ],
    { cwd: consumerDir },
  );

  step("Consumer bauen (next build)");
  run("npx", ["next", "build"], { cwd: consumerDir });

  console.log(green("\n✔ Consumer-Check bestanden: jaklib lässt sich in einem Next-Projekt bauen."));
} catch (error) {
  failed = true;
  console.error(red(`\n✘ Consumer-Check fehlgeschlagen: ${error.message}`));
} finally {
  if (keep) {
    console.log(`Temp-Ordner behalten: ${tmp}`);
  } else {
    // Unter Windows halten Prozesse Dateien kurz nach dem Build noch offen → Retries.
    rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

process.exit(failed ? 1 : 0);
