import { Button } from "../Button";
import { cn } from "@/lib/cn";
import { ReactNode, useState } from "react";
import { TabContext, useTab } from "./hooks";
import styles from "./TabView.module.css";
import { TabButtonProps, TabPanelProps, TabViewProps } from "./TabView.types";

export function TabView({ initialTab, children }: TabViewProps) {
  const [active, setActive] = useState<string>(initialTab);

  return (
    <TabContext.Provider value={{ active, setActive }}>
      {children}
    </TabContext.Provider>
  );
}

export function TabSidebar({ children }: { children: ReactNode }) {
  return (
    <div className={cn(styles.base, styles.sidebar, "shrink-0")}>
      {children}
    </div>
  );
}

export function TabPanel({ id, children }: TabPanelProps) {
  const { active } = useTab();
  if (active !== id) return null;
  return <div className={cn(styles.base, styles.panel)}>{children}</div>;
}

export function TabButton({ id, children }: TabButtonProps) {
  const { active, setActive } = useTab();
  return (
    <>
      <Button
        variant={id === active ? "primary" : "text"}
        onClick={() => setActive(id)}
      >
        {children}
      </Button>
    </>
  );
}
