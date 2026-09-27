import { cn } from "@/lib/cn";
import { useState } from "react";
import CheckSVG from "../_icons/react/check";
import CloseSVG from "../_icons/react/close";
import styles from "./Notification.module.css";

const CLOSE_DURATION = 200;

export function Notification({}) {
  const [open, setOpen] = useState(true);
  const [closing, setClosing] = useState(false);

  function close() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, CLOSE_DURATION);
  }

  if (!open) return null;

  return (
    <div className="absolute bottom-5 right-5 min-w-100">
      <div
        className={cn(
          "flex rounded-xl overflow-hidden bg-surface",
          styles.toast,
          closing && styles.toastClosing,
        )}
      >
        <div className="flex gap-x-2">
          <div className="bg-success w-1 shrink-0 shadow shadow-emerald-500" />
          <div className="flex items-center">
            <span className="inline-flex w-12 h-12 [&>svg]:w-full [&>svg]:h-full p-2">
              <CheckSVG />
            </span>
          </div>
          <div className="flex flex-col py-4">
            <span className="text-text font-semibold">Erfolg</span>
            <span className="text-text-muted">Success: Information saved.</span>
          </div>
        </div>
        <div className="flex absolute top-1 right-1" onClick={close}>
          <span className="inline-flex w-9 h-9 [&>svg]:w-full [&>svg]:h-full p-2 text-text-muted hover:text-destructive transition-colors cursor-pointer">
            <CloseSVG />
          </span>
        </div>
      </div>
    </div>
  );
}
