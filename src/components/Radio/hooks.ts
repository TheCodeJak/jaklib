import { createContext, useContext } from "react";

export const RadioGroupContext = createContext<{
  name: string;
  value: string;
  onChange: (value: string) => void;
} | null>(null);

export function useRadioGroup() {
  const context = useContext(RadioGroupContext);
  if (!context)
    throw new Error("Radio muss innerhlab von <RadioGroup> verwendet werden!");
  return context;
}
