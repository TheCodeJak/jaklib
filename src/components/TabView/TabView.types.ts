import { ReactNode } from "react";
import { ButtonProps } from "../Button";

export type TabViewProps = {
  initialTab: string;
  children: ReactNode;
};

export type TabPanelProps = {
  id: string;
  children: ReactNode;
};

export interface TabButtonProps extends ButtonProps {
  id: string;
}
