import { DashboardNavigation } from "@/components/navigation/dashboard-navigation";
import { DashboardOverviewBoard } from "@/components/dashboard/dashboard-overview-board";
import { EnvironmentDataProvider } from "@/components/environment/environment-data-provider";
import type { EnvironmentSnapshot } from "@/lib/environment/types";
import styles from "./dashboard-shell.module.css";

interface DashboardShellProps {
  children: React.ReactNode;
  environmentSnapshot: EnvironmentSnapshot;
}

export function DashboardShell({ children, environmentSnapshot }: DashboardShellProps) {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#dashboard-content">
        跳到页面内容
      </a>

      <DashboardNavigation />
      <EnvironmentDataProvider initialSnapshot={environmentSnapshot}>
        <DashboardOverviewBoard />
      </EnvironmentDataProvider>

      <main className={styles.content} id="dashboard-content">
        {children}
      </main>
    </div>
  );
}
