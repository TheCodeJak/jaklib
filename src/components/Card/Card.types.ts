import type { HTMLAttributes } from "react"; /* HIER ANPASSEN: Basis-HTML-Typ ändern (z.B. HTMLButtonElement) */

/* HIER ANPASSEN: Erlaubte Varianten und Größen erweitern */
export type CardVariant = "basic" | "panel";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}
