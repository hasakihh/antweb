export type ForecastRange = 3 | 7 | 15;

export type WeatherCondition =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "light-rain"
  | "moderate-rain";

export interface WeatherForecastDay {
  date: string;
  weekday: string;
  condition: WeatherCondition;
  conditionLabel: string;
  temperatureMin: number;
  temperatureMax: number;
  relativeHumidity: number;
  precipitationProbability: number;
  windDirection: string;
  windScale: string;
  pressure: number;
}

export interface WeatherForecast {
  location: string;
  range: ForecastRange;
  updatedAt: string;
  source: "mock" | "qweather";
  days: WeatherForecastDay[];
}

export interface FieldObservation {
  id: string;
  deviceId: string;
  temperature: number;
  relativeHumidity: number;
  pressure: number;
  recordedAt: string;
}

export interface EnvironmentSnapshot {
  observations: FieldObservation[];
  latest: FieldObservation | null;
  temperatureDelta: number | null;
  humidityDelta: number | null;
  syncedAt: string;
  source: "mock-database" | "database";
}

