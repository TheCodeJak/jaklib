import { cn } from "@/lib/cn";
import { Children, isValidElement, type ReactElement } from "react";
import { Card } from "../Card";
import { Divider } from "../Divider";
import styles from "./Panel.module.css";
import type { PanelProps, PanelSectionProps } from "./Panel.types";

function PanelHeader({ children, className, ...props }: PanelSectionProps) {
  return (
    <div className={cn(styles.header, className)} {...props}>
      {children}
    </div>
  );
}
PanelHeader.displayName = "PanelHeader";

function PanelContent({ children, className, ...props }: PanelSectionProps) {
  return (
    <div className={cn(styles.content, className)} {...props}>
      {children}
    </div>
  );
}
PanelContent.displayName = "PanelContent";

function PanelFooter({ children, className, ...props }: PanelSectionProps) {
  return (
    <div className={cn(styles.footer, className)} {...props}>
      {children}
    </div>
  );
}
PanelFooter.displayName = "PanelFooter";

function PanelRoot({ children, className, ...props }: PanelProps) {
  const childArray = Children.toArray(children);

  const find = (name: string) =>
    childArray.find(
      (c): c is ReactElement =>
        isValidElement(c) &&
        (c.type as { displayName?: string }).displayName === name,
    );

  const header = find("PanelHeader");
  const content = find("PanelContent");
  const footer = find("PanelFooter");

  return (
    <Card variant="panel" className={className} {...props}>
      {header && <div className={styles.header}>{header}</div>}
      <Divider />
      {content && <div className={styles.content}>{content}</div>}
      <Divider />
      {footer && <div className={styles.footer}>{footer}</div>}
    </Card>
  );
}

export const Panel = Object.assign(PanelRoot, {
  Header: PanelHeader,
  Content: PanelContent,
  Footer: PanelFooter,
});
