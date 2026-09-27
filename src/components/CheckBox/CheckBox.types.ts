import type { HTMLAttributes } from "react"; /* HIER ANPASSEN: Basis-HTML-Typ ändern (z.B. HTMLButtonElement) */

export interface CheckBoxProps extends Omit<
  HTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}
