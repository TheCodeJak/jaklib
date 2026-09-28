import { TextField as CoreTextField, TextFieldProps as CoreTextFieldProps } from "@/components";
import { useField } from "formik";

export interface TextFieldProps
  extends Omit<CoreTextFieldProps, "name" | "error"> {
  name: string;
}

export function TextField({ name, ...props }: TextFieldProps) {
  const [field, meta] = useField(name);
  const error = meta.touched && meta.error ? meta.error : undefined;

  return (
    <CoreTextField {...props} {...field} error={error}/>
  )
}