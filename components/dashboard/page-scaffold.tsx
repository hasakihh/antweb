import type { ReactNode } from "react";
import styles from "./dashboard-shell.module.css";

interface PageScaffoldProps {
  title: string;
  englishLabel: string;
  children?: ReactNode;
}

export function PageScaffold({
  title,
  englishLabel,
  children,
}: PageScaffoldProps) {
  return (
    <article className={styles.page} aria-labelledby="dashboard-page-title">
      <header className={styles.pageHeader}>
        <p>ANT-VIGIL / {englishLabel}</p>
        <h1 className={styles.pageTitle} id="dashboard-page-title">
          {title}
        </h1>
      </header>
      {children}
    </article>
  );
}
