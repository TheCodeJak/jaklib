import { Dropdown as CoreDropdown, DropdownProps as CoreDropdownProps } from "@/components";
import { useField } from "formik";

export interface DropdownProps
  extends Omit<CoreDropdownProps, "name" | "error"> {
  name: string;
}

export function Dropdown({ name, ...props }: DropdownProps) {
  const [field, meta] = useField(name);
  const error = meta.touched && meta.error ? meta.error : undefined;

  return (
    <CoreDropdown {...props} {...field} error={error}/>
  )
}