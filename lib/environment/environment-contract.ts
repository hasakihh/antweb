import type {
  EnvironmentSnapshot,
  FieldObservation,
  WeatherForecast,
  WeatherForecastDay,
} from "@/lib/environment/types";

export type JsonRecord = Record<string, unknown>;

export function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

export function isFieldObservation(value: unknown): value is FieldObservation {
  return (
    isJsonRecord(value) &&
    typeof value.id === "string" &&
    typeof value.deviceId === "string" &&
    typeof value.temperature === "number" &&
    typeof value.relativeHumidity === "number" &&
    typeof value.pressure === "number" &&
    typeof value.recordedAt === "string"
  );
}

export function isEnvironmentSnapshot(value: unknown): value is EnvironmentSnapshot {
  return (
    isJsonRecord(value) &&
    Array.isArray(value.observations) &&
    value.observations.every(isFieldObservation) &&
    (value.latest === null || isFieldObservation(value.latest)) &&
    (value.temperatureDelta === null || typeof value.temperatureDelta === "number") &&
    (value.humidityDelta === null || typeof value.humidityDelta === "number") &&
    typeof value.syncedAt === "string" &&
    (value.source === "mock-database" || value.source === "database")
  );
}

const weatherConditions = new Set([
  "sunny",
  "partly-cloudy",
  "cloudy",
  "light-rain",
  "moderate-rain",
]);

export function isWeatherForecastDay(value: unknown): value is WeatherForecastDay {
  return (
    isJsonRecord(value) &&
    typeof value.date === "string" &&
    typeof value.weekday === "string" &&
    typeof value.condition === "string" &&
    weatherConditions.has(value.condition) &&
    typeof value.conditionLabel === "string" &&
    typeof value.temperatureMin === "number" &&
    typeof value.temperatureMax === "number" &&
    typeof value.relativeHumidity === "number" &&
    typeof value.precipitationProbability === "number" &&
    typeof value.windDirection === "string" &&
    typeof value.windScale === "string" &&
    typeof value.pressure === "number"
  );
}

export function isWeatherForecast(value: unknown): value is WeatherForecast {
  return (
    isJsonRecord(value) &&
    typeof value.location === "string" &&
    (value.range === 3 || value.range === 7 || value.range === 15) &&
    typeof value.updatedAt === "string" &&
    (value.source === "mock" || value.source === "qweather") &&
    Array.isArray(value.days) &&
    value.days.every(isWeatherForecastDay)
  );
}
