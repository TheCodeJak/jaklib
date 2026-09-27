import type { ReactNode } from "react";

export interface RadioProps {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}
