import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getEnvironmentSnapshot } from "@/lib/environment/environment-repository";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const environmentSnapshot = await getEnvironmentSnapshot();

  return (
    <DashboardShell
      environmentSnapshot={environmentSnapshot}
    >
      {children}
    </DashboardShell>
  );
}
