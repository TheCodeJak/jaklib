import { cn } from "@/lib/cn";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import CloseSVG from "../_icons/react/close";
import { Button } from "../Button";
import { Card } from "../Card";
import { Divider } from "../Divider";
import styles from "./Modal.module.css";
import type { ModalProps, ModalSize } from "./Modal.types";

const sizeMap: Record<ModalSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/* Ab dieser Zugdistanz schließt das Sheet, darunter federt es zurück. */
const DRAG_CLOSE_THRESHOLD = 110;

/* Portal erst im Browser rendern: beim SSR gibt es kein document.
   useSyncExternalStore liefert serverseitig false, nach der Hydration true —
   ohne setState im Effect und ohne Hydration-Mismatch. */
const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  variant = "dialog",
  title,
  footer,
  size = "md",
  closeLabel = "Schließen",
  children,
  className,
  style,
  ...props
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const mounted = useSyncExternalStore(neverChanges, onClient, onServer);

  const isSheet = variant === "sheet";
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(0);

  // immer die aktuelle onClose-Funktion nutzen, ohne den Escape-Effect
  // bei jedem Render neu aufzusetzen
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const lastFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") return onCloseRef.current();
      if (e.key !== "Tab" || !dialogRef.current) return;

      // Fokus-Falle: Tab bleibt im Dialog
      const items = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      const first = items[0];
      const last = items.at(-1);

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = prevOverflow;
      lastFocused?.focus();
    };
  }, [open]);

  function handleDragStart(e: PointerEvent<HTMLDivElement>) {
    dragStart.current = e.clientY;
    setDragging(true);
    // alle folgenden Pointer-Events an den Griff binden
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleDragMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    // nur nach unten ziehen
    setDragOffset(Math.max(0, e.clientY - dragStart.current));
  }

  function handleDragEnd(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    if (dragOffset > DRAG_CLOSE_THRESHOLD) onClose();
    setDragOffset(0);
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        styles.overlay,
        isSheet && styles.overlaySheet,
        open && styles.isOpen,
      )}
      aria-hidden={!open}
      inert={!open}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          styles.dialog,
          isSheet ? styles.sheet : styles.centered,
          dragging && styles.dragging,
          sizeMap[size],
          className,
        )}
        {...props}
        style={
          isSheet && open && dragOffset > 0
            ? { ...style, transform: `translateY(${dragOffset}px)` }
            : style
        }
      >
        <Card
          variant="panel"
          className={cn(styles.panel, isSheet && styles.panelSheet)}
        >
          {isSheet && (
            <div
              className={styles.handle}
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
            >
              <div className={styles.handleBar} />
            </div>
          )}
          <div className={cn(styles.header, isSheet && styles.headerSheet)}>
            {title ? (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            ) : (
              <span />
            )}
            <Button
              variant="text"
              size="sm"
              className={styles.close}
              aria-label={closeLabel}
              onClick={onClose}
            >
              <span className={styles.closeIcon}>
                <CloseSVG />
              </span>
            </Button>
          </div>
          <Divider />
          <div className={styles.body}>{children}</div>
          {footer && (
            <>
              <Divider />
              <div className={styles.footer}>{footer}</div>
            </>
          )}
        </Card>
      </div>
    </div>,
    document.body,
  );
}
