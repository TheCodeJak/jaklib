import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";
import ArrowDownSVG from "../_icons/react/arrow_down";
import styles from "./Dropdown.module.css";
import type { DropdownProps } from "./Dropdown.types";

const CLOSE_DURATION = 200; // ms — muss zur CSS-Animation passen

export function Dropdown({
  label,
  options,
  placeholder,
  onChange,
  className,
}: DropdownProps) {
  const [value, setValue] = useState(options[0].value);
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fieldId = label?.toLowerCase().replace(/\s+/g, "-");
  const selected = options.find((option) => option.value === value);

  function closeDropdown() {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, CLOSE_DURATION);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        !isClosing &&
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, isClosing]);

  return (
    <div ref={ref} className={cn(styles.wrapper, className)}>
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={fieldId} className={styles.label}>
            {label}
          </label>
        )}

        <button
          className={styles.trigger}
          onClick={() => (open ? closeDropdown() : setOpen(true))}
          aria-haspopup="listbox"
          aria-expanded={open && !isClosing}
        >
          {selected?.label ?? placeholder}
          <span className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
            <ArrowDownSVG color="#ff8904" />
          </span>
        </button>
        {(open || isClosing) && (
          <ul
            className={cn(styles.list, isClosing && styles.listClosing)}
            role="listbox"
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={cn(
                  styles.option,
                  option.value === value && styles.optionSelected,
                )}
                onClick={() => {
                  onChange?.(option.value);
                  setValue(option.value);
                  closeDropdown();
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
