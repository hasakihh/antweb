import { PageScaffold } from "@/components/dashboard/page-scaffold";
import { MonitoringWorkspace } from "@/components/monitoring/monitoring-workspace";

export default function MonitoringPage() {
  return (
    <PageScaffold title="监测" englishLabel="MONITORING">
      <MonitoringWorkspace />
    </PageScaffold>
  );
}
