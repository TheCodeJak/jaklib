@AGENTS.md

# jaklib – Design System Anweisung

## Setup

jaklib verwendet Tailwind CSS v4 mit einem zweistufigen Token-System für Light/Dark Mode.
Alle Tokens sind zentral in `src/styles/tokens.css` definiert.
Komponenten stylen sich über `.module.css` Dateien – ergänzt durch Tailwind direkt im JSX.

## Dateistruktur

```
src/styles/
├── tokens.css   ← Alle Tokens (Farbe, Spacing, Typography) – NUR hier rohe Werte!
└── global.css   ← @import "tailwindcss" + @theme inline + @variant dark
```

---

## Tokens definieren (alle aufgeführten Tokens sind Beispiele und werden nicht direkt übernommen, nur die dargestellte Struktur)

### 1. Farben (tokens.css)

```css
:root {
  /* Primitives – rohe Werte, nie direkt in Komponenten verwenden */
  --zinc-50: #fafafa;
  --zinc-400: #a1a1aa;
  --zinc-600: #52525b;
  --zinc-800: #27272a;
  --zinc-900: #18181b;
  --indigo-400: #818cf8;
  --indigo-500: #6366f1;
  --indigo-600: #4f46e5;

  /* Semantisch – Light Mode */
  --bg: var(--zinc-50);
  --surface: var(--zinc-100);
  --primary: var(--indigo-500);
  --primary-hover: var(--indigo-600);
  --text: var(--zinc-900);
  --text-muted: var(--zinc-600);
}

.dark {
  --bg: var(--zinc-900);
  --surface: var(--zinc-800);
  --primary: var(--indigo-400);
  --primary-hover: var(--indigo-500);
  --text: var(--zinc-50);
  --text-muted: var(--zinc-400);
}
```

### 2. Spacing (tokens.css)

```css
:root {
  --space-1: 0.25rem; /*  4px */
  --space-2: 0.5rem; /*  8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
}
```

### 3. Typography (tokens.css)

```css
:root {
  /* Font Families */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Font Sizes */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-loose: 1.75;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
}
```

---

## Tailwind Utilities registrieren (global.css)

```css
@import "tailwindcss";

@theme inline {
  /* Farben */
  --color-bg: var(--background);
  --color-surface: var(--surface);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-text: var(--text);
  --color-text-muted: var(--text-muted);

  /* Spacing */
  --spacing-1: var(--space-1);
  --spacing-2: var(--space-2);
  --spacing-3: var(--space-3);
  --spacing-4: var(--space-4);
  --spacing-6: var(--space-6);
  --spacing-8: var(--space-8);
  --spacing-12: var(--space-12);
  --spacing-16: var(--space-16);

  /* Typography */
  --font-family-sans: var(--font-sans);
  --font-family-mono: var(--font-mono);
  --font-size-xs: var(--text-xs);
  --font-size-sm: var(--text-sm);
  --font-size-base: var(--text-base);
  --font-size-lg: var(--text-lg);
  --font-size-xl: var(--text-xl);
  --font-size-2xl: var(--text-2xl);

  /* Border Radius */
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-full: var(--radius-full);
}

@variant dark (&:where(.dark, .dark *));
```

---

## Styling-Strategie: Was geht wohin?

### CSS Module (`.module.css`)

Für die **visuelle Identität** der Komponente – alles was die Komponente _aussehen_ lässt wie sie ist:

- Farben (via `@apply` für Dark-Mode-awareness)
- Typografie, Spacing innerhalb der Komponente
- Border-Radius, Transitions, Shadows

### Tailwind direkt im JSX

Für **Struktur und Layout** – alles was vom Kontext abhängt und sich von Verwendung zu Verwendung ändern kann:

- Flex/Grid (`flex`, `grid`, `flex-col`, ...)
- Äußere Abstände (`mt-4`, `mb-8`, ...)
- Positionierung (`relative`, `absolute`, ...)
- Responsive Breakpoints (`md:flex-row`, ...)
- Sichtbarkeit/Display (`hidden`, `block`, ...)

---

## Beispiele

### Button.tsx

```tsx
// Layout-Wrapper → Tailwind direkt
<div className="flex items-center gap-2">
  <button className={styles.button}>Speichern</button>
  <button className={styles.buttonSecondary}>Abbrechen</button>
</div>
```

### Button.module.css

```css
/* Visuelle Identität → CSS Module */
.button {
  @apply bg-primary text-white;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: background-color 150ms ease;
}

.button:hover {
  @apply bg-primary-hover;
}
```

### Card.tsx

```tsx
// Äußeres Layout → Tailwind direkt
<div className="grid grid-cols-2 gap-6 p-8">
  <div className={styles.card}>
    <h2 className={styles.cardTitle}>Titel</h2>
    <p className={styles.cardBody}>Text</p>
  </div>
</div>
```

### Card.module.css

```css
.card {
  @apply bg-surface text-text;
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.cardTitle {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  @apply text-text;
}

.cardBody {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  @apply text-text-muted;
}
```

---

## Regeln (Zusammenfassung)

1. Rohe Werte (Hex, rem, px) **nur in `tokens.css`** – niemals in Komponenten
2. **Visuelle Identität** (Farben, Typo, inneres Spacing) → CSS Module
3. **Layout & Struktur** (Flex, Grid, äußere Abstände, Responsiveness) → Tailwind direkt im JSX
4. Farben immer via **`@apply`** in CSS Modules (Dark-Mode-aware)
5. Spacing, Typography, Radius via **`var()`** direkt in CSS Modules
6. Neue Farbe? → Primitive → Semantisch (Light + Dark) → `@theme inline` → dann erst verwenden
7. Neues Spacing/Typography? → Token in `tokens.css` → `@theme inline` → verwenden
