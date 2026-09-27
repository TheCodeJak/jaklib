import { cn } from "@/lib/cn";
import { useState } from "react";
import ArrowRightSVG from "../_icons/react/arrow_right";
import FolderSVG from "../_icons/react/folder";
import styles from "./Folder.module.css";

export function Folder({
  name,
  children,
}: {
  name: string;
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.parent} onClick={() => setExpanded(!expanded)}>
        <span
          className={cn(
            styles.arrow,
            expanded && styles.arrowExpanded,
            "[&>svg]:w-full [&>svg]:h-full",
            !children && "invisible",
          )}
        >
          <ArrowRightSVG />
        </span>
        <span className={cn(styles.folderIcon, "[&>svg]:w-full [&>svg]:h-full")}>
          <FolderSVG />
        </span>
        <span className={styles.folderName}>{name}</span>
      </div>
      {children && (
        <div className={cn(styles.children, expanded && styles.childrenExpanded)}>
          <div className={styles.childrenInner}>{children}</div>
        </div>
      )}
    </div>
  );
}
