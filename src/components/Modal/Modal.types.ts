import type { HTMLAttributes, ReactNode } from "react";

/** `dialog` = zentriert, `sheet` = fährt von unten ein (mit Drag-Handle). */
export type ModalVariant = "dialog" | "sheet";
export type ModalSize = "sm" | "md" | "lg";

// `title` wird als ReactNode neu definiert, deshalb das HTML-Attribut ausschließen
export interface ModalProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Steuert die Sichtbarkeit — das Overlay bleibt gemountet. */
  open: boolean;
  /** Wird von Escape, Overlay-Klick, Close-Button und Swipe-down aufgerufen. */
  onClose: () => void;
  /** Darstellung: zentrierter Dialog oder Bottom-Sheet. */
  variant?: ModalVariant;
  /** Titel in der Kopfzeile, verknüpft per aria-labelledby. */
  title?: ReactNode;
  /** Aktionsleiste am unteren Rand (z.B. Abbrechen/Speichern). */
  footer?: ReactNode;
  /** Maximale Breite des Dialogs. */
  size?: ModalSize;
  /** Aria-Label des Close-Buttons. */
  closeLabel?: string;
}
