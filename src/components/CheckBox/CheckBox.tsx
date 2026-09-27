import { cn } from "@/lib/cn";
import styles from "./CheckBox.module.css";
import type { CheckBoxProps } from "./CheckBox.types";

export function CheckBox({
  label,
  checked = false,
  disabled,
  onChange,
  className,
}: CheckBoxProps) {
  return (
    <label
      className={cn(
        "flex items-center space-x-3 cursor-pointer select-none",
        className,
      )}
    >
      {/* 1. Unsichtbarer Input mit CSS-Klasse */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className={styles.hiddenInput}
        disabled={disabled}
      />

      {/* 2. Custom-Box: Wird über das CSS-Modul gestylt */}
      <div className={styles.customBox}>
        {/* 3. Custom-Icon (z.B. ein Kreuz "X") */}
        <svg
          className={styles.customIcon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            id="primary"
            d="M10,18a1,1,0,0,1-.71-.29l-5-5a1,1,0,0,1,1.42-1.42L10,15.59l8.29-8.3a1,1,0,1,1,1.42,1.42l-9,9A1,1,0,0,1,10,18Z"
            style={{
              fill: "rgb(0, 0, 0)",
            }}
          />
        </svg>
      </div>

      <span className={styles.label}>{label}</span>
    </label>
  );
}
