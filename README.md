# jaklib

Komponenten-Bibliothek (React 19, Next 16, Tailwind 4) mit eigener Demo-App.
Das Repo ist beides: die Bibliothek unter `src/` und eine Next-App unter `app/`,
die als Spielwiese dient.

```bash
npm run dev     # Demo-App auf http://localhost:3001
```

> **Lizenz:** All Rights Reserved (siehe [LICENSE](./LICENSE)). Das Repo ist
> öffentlich lesbar, damit es sich direkt als Git-Dependency einbinden lässt —
> das erlaubt keine Nutzung durch Dritte ohne Erlaubnis.

---

## Einbindung in ein anderes Projekt

jaklib wird über eine **Git-Dependency direkt von GitHub** eingebunden — ohne
Registry, ohne Tarball, ohne dass der Konsument Zugriff auf diesen Ordner
braucht.

### 1. Abhängigkeit eintragen

```jsonc
// package.json des Konsumenten
"dependencies": {
  "jaklib": "github:TheCodeJak/jaklib#main"
}
```

```bash
npm install
```

npm klont das Repo, führt darin `prepare` aus (baut die Bibliothek mit `tsup`)
und installiert das Ergebnis. Der aufgelöste Commit landet in der
`package-lock.json` — `npm ci` installiert danach exakt diesen Stand, auch im
Docker-Build und bei Vercel.

**Voraussetzung im Docker-Image:** `git` muss installiert sein, damit npm die
Git-Dependency klonen kann (z. B. `alpine`-Images: `apk add --no-cache git`).

### 2. Auf den aktuellsten Stand bringen

```bash
npm update jaklib
```

Löst `main` neu auf und schreibt den neuen Commit in die Lockfile. Kein
manuelles Kopieren, kein Versions-Hochzählen nötig.

### 3. Styles einmal importieren

```tsx
// app/layout.tsx
import "jaklib/styles.css";
import "./globals.css"; // eigene Styles danach, damit sie die Tokens überschreiben können
```

Das CSS liegt als eigene Datei im Paket und wird **nicht** automatisch geladen.

### 4. Benutzen

```tsx
import { Button, Card } from "jaklib";
```

Alle öffentlichen Komponenten und ihre Typen kommen aus diesem einen Einstieg.

### Auf einer festen Version bleiben

Statt `#main` kann ein Tag gepinnt werden, sobald einer existiert:

```jsonc
"jaklib": "github:TheCodeJak/jaklib#v0.1.0"
```

Dann ändert sich nichts mehr von allein — Aktualisieren heißt dann: neuen Tag
setzen, im Konsumenten die Referenz ändern, `npm install`.

---

## Entwicklungs-Ablauf

### Schnell — lokal, ohne Container

Änderungen an jaklib sofort im Zielprojekt sehen, ohne Push-Zyklus:

```bash
# in jaklib
npm link
npx tsup --watch

# im Zielprojekt
npm link jaklib
```

**Achtung:** `npm install` und `npm ci` entfernen den Link — die
`package.json` behält dabei die `github:...`-Referenz, nur `node_modules/jaklib`
wird ausgetauscht. Nach `npm install` erneut `npm link jaklib` ausführen. Der
Watch-Modus baut nur JS und CSS-Modules neu — nach Änderungen an `src/lib.css`
oder `src/styles/` einmal `npm run build:lib`.

### Stabil — committen und pushen

Für Docker und Deployment reicht ein normaler Push auf `main` (oder ein Tag,
siehe oben) — der Konsument zieht die Änderung per `npm update jaklib`.

### Vor dem Ausliefern prüfen

```bash
npm run check:consumer
```

Packt die Bibliothek, installiert sie in ein frisches Next-Projekt in einem
Temp-Ordner und baut es. Geprüft wird dabei, dass `Button` und `Card` in einer
Server Component und eine Lib-Komponente mit Hook in einer Client Component
funktionieren. Mit `-- --keep` bleibt der Temp-Ordner zum Nachsehen erhalten.

---

## Alternative: Einbindung als Tarball

Für Umgebungen ohne Zugriff auf das GitHub-Repo (z. B. Air-Gapped-Deployments)
lässt sich jaklib weiterhin als `.tgz` bauen und verteilen.

```bash
npm run pack:lib
```

Baut die Bibliothek und legt `pack/jaklib-<version>.tgz` ab.

> Vorher die Version erhöhen (`npm version patch`). npm cached `file:`-Tarballs;
> bei gleichbleibendem Dateinamen zieht der Konsument sonst die alte Fassung.

Im Zielprojekt:

```
projekt/
└── vendor/
    └── jaklib-0.1.0.tgz
```

```jsonc
"dependencies": {
  "jaklib": "file:vendor/jaklib-0.1.0.tgz"
}
```

Der Ordner `vendor/` muss eingecheckt sein und darf weder in `.gitignore` noch
in `.dockerignore` stehen. Ein Verweis auf `file:../jaklib` darf nicht
entstehen — der wäre außerhalb des eigenen Rechners nicht auflösbar.

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
- **`prepare` und `prepack` bauen beide `dist/`.** `prepare` läuft bei
  `npm install github:...` (Git-Dependency), `prepack` bei `npm pack`
  (Tarball). Ohne `prepare` bekäme ein Konsument über die Git-Dependency ein
  Paket ohne `dist/`.

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
