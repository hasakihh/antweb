import { PageScaffold } from "@/components/dashboard/page-scaffold";
import { EnvironmentWorkspace } from "@/components/environment/environment-workspace";
import {
  DEFAULT_WEATHER_LOCATION,
  getWeatherForecast,
} from "@/lib/environment/weather-service";

export default async function EnvironmentPage() {
  const forecast = await getWeatherForecast(DEFAULT_WEATHER_LOCATION, 7);

  return (
    <PageScaffold title="环境" englishLabel="ENVIRONMENT">
      <EnvironmentWorkspace initialForecast={forecast} />
    </PageScaffold>
  );
}
