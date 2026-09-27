# jaklib

Komponenten-Bibliothek (React 19, Next 16, Tailwind 4) mit eigener Demo-App.
Das Repo ist beides: die Bibliothek unter `src/` und eine Next-App unter `app/`,
die als Spielwiese dient.

```bash
npm run dev     # Demo-App auf http://localhost:3001
```

---

## Einbindung in ein anderes Projekt

jaklib wird **nicht** über eine Registry verteilt, sondern als Tarball. Der
Konsument braucht damit weder Zugriff auf diesen Ordner noch auf Git — wichtig,
damit `npm ci` im Docker-Build funktioniert.

### 1. Paket bauen

```bash
npm run pack:lib
```

Das baut die Bibliothek (`tsup` + Tailwind-Schritt) und legt
`pack/jaklib-<version>.tgz` ab.

> Erhöhe vorher die Version (`npm version patch`). npm cached `file:`-Tarballs;
> bei gleichbleibendem Dateinamen zieht der Konsument sonst die alte Fassung.

### 2. Tarball ins Zielprojekt kopieren

```
householdplaner/
└── vendor/
    └── jaklib-0.1.0.tgz
```

Der Ordner `vendor/` muss eingecheckt und **darf weder in `.gitignore` noch in
`.dockerignore` stehen** — sonst schlägt `npm ci` im Container fehl. Achte
besonders auf pauschale Einträge wie `*.tgz` oder `vendor`.

### 3. Abhängigkeit eintragen

```jsonc
// householdplaner/package.json
"dependencies": {
  "jaklib": "file:vendor/jaklib-0.1.0.tgz"
}
```

Dann `npm install`. Ein Verweis auf `file:../jaklib` darf nicht entstehen — der
wäre im Container nicht auflösbar.

### 4. Styles einmal importieren

```tsx
// householdplaner/app/layout.tsx
import "jaklib/styles.css";
import "./globals.css"; // eigene Styles danach, damit sie die Tokens überschreiben können
```

Das CSS liegt als eigene Datei im Paket und wird **nicht** automatisch geladen.

### 5. Benutzen

```tsx
import { Button, Card } from "jaklib";
```

Alle öffentlichen Komponenten und ihre Typen kommen aus diesem einen Einstieg.

---

## Entwicklungs-Ablauf

### Schnell — lokal, ohne Docker

Änderungen an jaklib sofort im Zielprojekt sehen:

```bash
# in jaklib
npm link
npx tsup --watch

# im householdplaner
npm link jaklib
```

**Achtung:** `npm install` und `npm ci` entfernen den Link. Danach erneut
`npm link jaklib` ausführen. Der Watch-Modus baut nur JS und CSS-Modules neu —
nach Änderungen an `src/lib.css` oder `src/styles/` einmal `npm run build:lib`.

### Stabil — für Docker und Deployment

```bash
# in jaklib
npm version patch
npm run pack:lib

# Tarball nach householdplaner/vendor/ kopieren,
# Version in dessen package.json anpassen, dann:
npm install
```

### Vor dem Ausliefern prüfen

```bash
npm run check:consumer
```

Packt die Bibliothek, installiert sie in ein frisches Next-Projekt in einem
Temp-Ordner und baut es. Geprüft wird dabei, dass `Button` und `Card` in einer
Server Component und eine Lib-Komponente mit Hook in einer Client Component
funktionieren. Mit `-- --keep` bleibt der Temp-Ordner zum Nachsehen erhalten.

---

## Wie das Paket aufgebaut ist

| Datei | Inhalt |
| --- | --- |
| `dist/index.mjs` / `dist/index.js` | ESM- und CJS-Bundle, beginnt mit `"use client"` |
| `dist/index.d.ts` / `.d.mts` | Typen |
| `dist/index.css` | Tokens + Utilities + Komponenten-CSS in einer Datei |

Ein paar Entscheidungen, die man kennen sollte:

- **`react` / `react-dom` sind `peerDependencies`**, nicht `dependencies`. Sonst
  landen zwei React-Kopien im Zielprojekt und jeder Hook wirft
  „Invalid hook call". Prüfen mit `npm ls react` — es darf nur eine 19.x geben.
  Für den Build stehen sie zusätzlich in `devDependencies`.
- **Das CSS ist eigenständig.** Der Konsument braucht kein Tailwind und keine
  passende Tailwind-Konfiguration. Ausgeliefert werden nur die Utilities, die in
  `src/` tatsächlich vorkommen, und bewusst **kein** Preflight — der Reset des
  Zielprojekts bleibt unangetastet.
- **Die Design-Tokens sind überschreibbar.** Sie stehen ungelayert auf `:root`;
  ein eigenes `:root { --primary: … }` im Zielprojekt gewinnt, solange es nach
  `jaklib/styles.css` geladen wird.
- **Der CSS-Build läuft in zwei Schritten** (`tsup && node scripts/build-css.mjs`).
  Grund: tsup erzwingt für alle `.css` denselben esbuild-Loader. Die
  `*.module.css` brauchen `local-css`, die globalen Tailwind-Utilities dürfen
  aber nicht umbenannt werden — sonst würde aus `.absolute` ein `.lib_absolute`
  und jede Klasse im JSX liefe ins Leere.

## CSS-Dateien in `src/`

| Datei | Rolle |
| --- | --- |
| `styles/tokens.css` | Rohe Werte und semantische Tokens, Light + Dark |
| `styles/theme-map.css` | `@theme inline` — mappt Tokens auf Tailwind-Utilities |
| `styles/theme.css` | Voller Tailwind-Kontext, Ziel von `@reference` in den Modules |
| `lib.css` | Einstieg des ausgelieferten CSS (Tokens + Utilities, kein Preflight) |
| `globals.css` | Nur für die Demo-App |

Dark Mode läuft über `@media (prefers-color-scheme: dark)` — das Zielprojekt
braucht dafür keine `.dark`-Klasse.
