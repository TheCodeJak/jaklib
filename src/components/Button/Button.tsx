import type { ButtonProps } from "./Button.types";
import { cn } from "@/lib/cn";
import styles from "./Button.module.css";

const sizeMap = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const;

const variantMap = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  text: styles.text,
  destructive: styles.destructive,
  success: styles.success,
} as const;

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(styles.base, sizeMap[size], variantMap[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      <span>{loading ? "Loading…" : children}</span>
    </button>
  );
}
