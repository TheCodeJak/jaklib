import { cn } from "@/lib/cn";
import { useId } from "react";
import styles from "./TextField.module.css";
import type { TextFieldProps } from "./TextField.types";

export function TextField({
  label,
  name,
  className,
  error,
  ...props
}: TextFieldProps) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
      )}

      <input
        name={name}
        id={fieldId}
        className={cn(styles.base, error ? styles.baseError : "", className)}
        {...props}
      />

      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
