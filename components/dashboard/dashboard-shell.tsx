import Link from "next/link";
import { DashboardNavigation } from "@/components/navigation/dashboard-navigation";
import { DashboardOverviewBoard } from "@/components/dashboard/dashboard-overview-board";
import styles from "./dashboard-shell.module.css";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#dashboard-content">
        跳到页面内容
      </a>

      <header className={styles.shellHeader}>
        <Link className={styles.brand} href="/overview" aria-label="返回监测概览">
          <span>
            <strong>小火蚁监测</strong>
            <small>ANT-VIGIL CONTROL</small>
          </span>
          <i aria-hidden="true" />
        </Link>
      </header>

      <DashboardNavigation />
      <DashboardOverviewBoard />

      <main className={styles.content} id="dashboard-content">
        {children}
      </main>
    </div>
  );
}
