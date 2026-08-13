import { PageScaffold } from "@/components/dashboard/page-scaffold";
import { ThemeSettings } from "@/components/settings/theme-settings";

export default function SettingsPage() {
  return (
    <PageScaffold title="用户设置" englishLabel="SETTINGS">
      <ThemeSettings />
    </PageScaffold>
  );
}
