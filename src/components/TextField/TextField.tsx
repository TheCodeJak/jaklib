import { cn } from "@/lib/cn";
import styles from "./TextField.module.css";
import type { TextFieldProps } from "./TextField.types";

export function TextField({ label, className, id, ...props }: TextFieldProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
      )}

      <input id={fieldId} className={cn(styles.base, className)} {...props} />
    </div>
  );
}
