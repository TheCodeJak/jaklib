import { cn } from "@/lib/cn";
import styles from "./Card.module.css";
import type { CardProps } from "./Card.types";

const variantMap: Record<NonNullable<CardProps["variant"]>, string> = {
  basic: styles.basic,
  panel: styles.panel,
};

export function Card({
  variant = "basic",
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div className={cn(styles.base, variantMap[variant], className)} {...props}>
      {children}
    </div>
  );
}
