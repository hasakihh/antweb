import styles from "./dashboard-shell.module.css";

interface PageScaffoldProps {
  title: string;
}

export function PageScaffold({ title }: PageScaffoldProps) {
  return (
    <article className={styles.page} aria-labelledby="dashboard-page-title">
      <h1 className={styles.pageTitle} id="dashboard-page-title">
        {title}
      </h1>
    </article>
  );
}
