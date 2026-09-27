// Eigene Typdeklaration fuer CSS Modules, unabhaengig von Next.js.
//
// Next.js liefert dieselbe Deklaration in next/types/global.d.ts,
// eingebunden ueber next-env.d.ts. Diese Datei ist aber zu Recht
// gitignored (Next generiert sie bei next dev/build neu) - beim
// isolierten Lib-Build (tsup, ohne vorherigen next-Lauf, z.B. direkt
// nach einem frischen git clone) existiert next-env.d.ts nicht,
// und ohne sie kennt der TypeScript-Compiler *.module.css nicht.
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
