type Option = { value: string; label: string };

export interface DropdownProps {
  label: string;
  options: Option[];
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
}
