import { ReactElement } from "react";
import { OptionProps } from "./Option";

export interface DropdownProps {
  label: string;
  children: ReactElement<OptionProps> | ReactElement<OptionProps>[];
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  error?: string;
}
