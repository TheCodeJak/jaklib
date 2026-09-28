import { Dropdown as CoreDropdown, DropdownProps as CoreDropdownProps } from "@/components";
import { useField } from "formik";

export interface DropdownProps
  extends Omit<
    CoreDropdownProps,
    "name" | "error" | "value" | "onChange" | "onBlur"
  > {
  name: string;
}

export function Dropdown({ name, ...props }: DropdownProps) {
  const [field, meta, helpers] = useField(name);
  const error = meta.touched && meta.error ? meta.error : undefined;

  return (
    <CoreDropdown
      {...props}
      name={name}
      value={field.value}
      onChange={(value) => helpers.setValue(value)}
      onBlur={field.onBlur}
      error={error}
    />
  );
}
