import { cn } from "@/lib/cn";
import styles from "./Switch.module.css";
import type { SwitchProps } from "./Switch.types";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  className,
}: SwitchProps) {
  return (
    <div
      className={cn(
        styles.wrapper,
        disabled && styles.wrapperDisabled,
        className,
      )}
    >
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(styles.track, checked && styles.trackOn)}
      >
        <span className={styles.thumb} />
        <span className={styles.state}>{checked ? "on" : "off"}</span>
      </button>
      {label && <span className={styles.labelText}>{label}</span>}
    </div>
  );
}
