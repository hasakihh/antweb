import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EnvironmentDataProvider } from "@/components/environment/environment-data-provider";
import { getEnvironmentSnapshot } from "@/lib/environment/environment-repository";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const environmentSnapshot = await getEnvironmentSnapshot();

  return (
    <EnvironmentDataProvider initialSnapshot={environmentSnapshot}>
      <DashboardShell>{children}</DashboardShell>
    </EnvironmentDataProvider>
  );
}
