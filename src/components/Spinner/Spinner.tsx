import styles from "./Spinner.module.css";

export const Spinner = () => {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Laden"
      role="status"
    >
      <circle cx="12" cy="12" r="9" className={styles["spinner-track"]} />

      <circle cx="12" cy="12" r="9" className={styles["spinner-ring"]} />
    </svg>
  );
};
