import fs from "fs";
import path from "path";

// Positionale Argumente: npm run generate:component -- <Name> <Zielverzeichnis>
const [name, targetDir] = process.argv.slice(2);

if (!name || !targetDir) {
  console.error(
    "\x1b[31mFehler: Bitte geben Sie Name und Zielverzeichnis an.\x1b[0m",
  );
  console.log("Beispiel: npm run generate:component -- Card ./src/components");
  process.exit(1);
}

// NEU: Hängt den Komponentennamen als Unterordner an den Zielpfad an
const componentDir = path.resolve(targetDir, name);

if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true });
}

// ---------------------------------------------------------
// 1. CSS Module Vorlage
// ---------------------------------------------------------
const contentCss = `
/* Base — shared across all variants */
.base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* HIER ANPASSEN: Globale Basis-Styles für ${name} */
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: background 0.15s, opacity 0.15s;
}

.base:disabled {
  opacity: var(--color-disabled-opacity);
  cursor: not-allowed;
}

/* ---- Sizes ---- */
/* HIER ANPASSEN: Größen-Klassen auf Ihre Design-Tokens abstimmen */
.sm { font-size: var(--font-size-sm); padding: 5px var(--space-3); }
.md { font-size: var(--font-size-md); padding: var(--space-2) 18px; }
.lg { font-size: var(--font-size-lg); padding: 11px var(--space-6); }

/* ---- Variants ---- */
/* HIER ANPASSEN: Farbvarianten für ${name} definieren */
.primary {
  background-color: var(--color-primary);
  color: var(--color-primary-text);
}
.primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.secondary {
  background-color: var(--color-secondary);
  color: var(--color-secondary-text);
}
.secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-hover);
}
`;

// ---------------------------------------------------------
// 2. Types Vorlage
// ---------------------------------------------------------
const contentTypes = `import type { HTMLAttributes } from "react"; /* HIER ANPASSEN: Basis-HTML-Typ ändern (z.B. HTMLButtonElement) */

/* HIER ANPASSEN: Erlaubte Varianten und Größen erweitern */
export type ${name}Variant = "primary" | "secondary" | "ghost" | "destructive";
export type ${name}Size = "sm" | "md" | "lg";

export interface ${name}Props extends HTMLAttributes<HTMLElement> {
  variant?: ${name}Variant;
  size?: ${name}Size;
  loading?: boolean;
  /* HIER ANPASSEN: Weitere typsichere Props hinzufügen (z.B. icon, title, isSelected) */
}
`;

// ---------------------------------------------------------
// 3. React Component Vorlage
// ---------------------------------------------------------
const contentComponent = `import { cn } from "@/lib/cn";
import styles from "./${name}.module.css";
import type { ${name}Props } from "./${name}.types";

/* HIER ANPASSEN: Mapping der Props auf die CSS-Klassen */
const sizeMap = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const;

const variantMap = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  destructive: styles.destructive,
} as const;

export function ${name}({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ${name}Props) {
  return (
    {/* HIER ANPASSEN: Das Basis-HTML-Element (div, button, a) anpassen */}
    <div
      className={cn(
        styles.base,
        sizeMap[size],
        variantMap[variant],
        className,
      )}
      /* HIER ANPASSEN: Attribute wie 'disabled' oder 'aria-*-' setzen */
      {...props}
    >
      {/* HIER ANPASSEN: Eigene Logik für Icons, Lade-Zustände oder Layouts */}
      {loading ? "Loading…" : children}
    </div>
  );
}
`;

// ---------------------------------------------------------
// 4. Index Vorlage (Barrel File)
// ---------------------------------------------------------
const contentIndex = `export { ${name} } from "./${name}";
export type { ${name}Props, ${name}Variant, ${name}Size } from "./${name}.types";
`;

// Dateipfade festlegen (nutzt jetzt componentDir statt absoluteDir)
const files = [
  { path: path.join(componentDir, `${name}.module.css`), content: contentCss },
  { path: path.join(componentDir, `${name}.types.ts`), content: contentTypes },
  { path: path.join(componentDir, `${name}.tsx`), content: contentComponent },
  { path: path.join(componentDir, "index.ts"), content: contentIndex },
];

// Dateien schreiben
try {
  files.forEach((file) => fs.writeFileSync(file.path, file.content, "utf8"));

  // Ausgabe des neuen, relativen Pfades für bessere Lesbarkeit
  const relativeOutput = path.relative(process.cwd(), componentDir);
  console.log(
    "\x1b[32m%s\x1b[0m",
    `\nKomponente '${name}' erfolgreich in './${relativeOutput}' erstellt!`,
  );
  files.forEach((file) => console.log(` - ${path.basename(file.path)}`));
} catch (error) {
  console.error("Fehler beim Schreiben der Dateien:", error);
}
