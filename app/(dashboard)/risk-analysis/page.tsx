import { PageScaffold } from "@/components/dashboard/page-scaffold";
import { RiskAnalysisWorkspace } from "@/components/risk-analysis/risk-analysis-workspace";

export default function RiskAnalysisPage() {
  return (
    <PageScaffold title="风险分析" englishLabel="RISK ANALYSIS">
      <RiskAnalysisWorkspace />
    </PageScaffold>
  );
}
