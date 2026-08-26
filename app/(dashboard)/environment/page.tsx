import { PageScaffold } from "@/components/dashboard/page-scaffold";
import { EnvironmentWorkspace } from "@/components/environment/environment-workspace";
import { EnvironmentDataProvider } from "@/components/environment/environment-data-provider";
import { getEnvironmentSnapshot } from "@/lib/environment/environment-repository";
import {
  DEFAULT_WEATHER_LOCATION,
  getWeatherForecast,
} from "@/lib/environment/weather-service";

export default async function EnvironmentPage() {
  const forecast = await getWeatherForecast(DEFAULT_WEATHER_LOCATION, 7);
  const environmentSnapshot = await getEnvironmentSnapshot();

  return (
    <PageScaffold title="环境" englishLabel="ENVIRONMENT">
      <EnvironmentDataProvider initialSnapshot={environmentSnapshot}>
        <EnvironmentWorkspace initialForecast={forecast} />
      </EnvironmentDataProvider>
    </PageScaffold>
  );
}
