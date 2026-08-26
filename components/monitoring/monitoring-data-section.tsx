import type { ReactNode } from "react";
import styles from "./monitoring-workspace.module.css";

export function MonitoringDataSection({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.dataSection}>
      <header className={styles.dataHeading}>
        <div>
          <p>{kicker}</p>
          <h2>{title}</h2>
        </div>
        {description ? <span>{description}</span> : null}
      </header>
      {children}
    </section>
  );
}

export function MonitoringEmptyTable({
  columns,
  emptyText,
  minWidth,
}: {
  columns: string[];
  emptyText: string;
  minWidth: number;
}) {
  return (
    <div className={styles.tableFrame}>
      <div className={styles.tableScroller}>
        <table style={{ minWidth }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      <div className={styles.emptyRows}>
        <span aria-hidden="true" />
        <p>{emptyText}</p>
      </div>
    </div>
  );
}
