import { cn } from "@/lib/cn";
import { RadioGroupContext, useRadioGroup } from "./hooks";
import styles from "./Radio.module.css";
import type { RadioGroupProps, RadioProps } from "./Radio.types";

export function Radio({ value, label, disabled, className }: RadioProps) {
  const group = useRadioGroup();

  return (
    <label
      className={cn(
        "flex items-center space-x-3 cursor-pointer select-none",
        className,
      )}
    >
      <input
        type="radio"
        name={group.name}
        checked={group.value === value}
        onChange={() => group.onChange(value)}
        disabled={disabled}
        className={styles.hiddenInput}
      />
      <div className={styles.customBox}>
        <span className={styles.dot} />
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}

export function RadioGroup({
  name,
  value,
  onChange,
  children,
  className,
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ name, value, onChange }}>
      {/* Layout (Tailwind, Regel 3!) gehört hier ins JSX, nicht ins CSS Module */}
      <div className={cn("flex flex-col gap-2", className)}>{children}</div>
    </RadioGroupContext.Provider>
  );
}
