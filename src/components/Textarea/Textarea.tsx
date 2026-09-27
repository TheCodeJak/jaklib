import { cn } from "@/lib/cn";
import styles from "./Textarea.module.css";
import type { TextareaProps } from "./Textarea.types";

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        className={cn(styles.base, styles.scrollbar, className)}
        {...props}
      />
    </div>
  );
}
