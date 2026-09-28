import { FocusEvent, ReactElement } from "react";
import { OptionProps } from "./Option";

export interface DropdownProps {
  label: string;
  value?: string;
  initialValue?: string;
  children: ReactElement<OptionProps> | ReactElement<OptionProps>[];
  placeholder?: string;
  onChange?: (value: string) => void;
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
  className?: string;
  name?: string;
  error?: string;
}
