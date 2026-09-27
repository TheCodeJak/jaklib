import { createContext, useContext } from "react";

export const TabContext = createContext<{
  active: string;
  setActive: (t: string) => void;
}>(null!);

export function useTab() {
  const context = useContext(TabContext);
  if (!context)
    throw new Error("useTab muss innerhalb von <TabView> aufgerufen werden!");
  return context;
}
