import "client-only";

import type {
  EnvironmentSnapshot,
  FieldObservation,
  ForecastRange,
  WeatherForecast,
  WeatherForecastDay,
} from "@/lib/environment/types";

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function isFieldObservation(value: unknown): value is FieldObservation {
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

function isEnvironmentSnapshot(value: unknown): value is EnvironmentSnapshot {
  return (
    isJsonRecord(value) &&
    Array.isArray(value.observations) &&
    value.observations.every(isFieldObservation) &&
    (value.latest === null || isFieldObservation(value.latest)) &&
    (value.temperatureDelta === null ||
      typeof value.temperatureDelta === "number") &&
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

function isWeatherForecastDay(value: unknown): value is WeatherForecastDay {
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

function isWeatherForecast(value: unknown): value is WeatherForecast {
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

async function readPayload(response: Response): Promise<JsonRecord> {
  try {
    const payload: unknown = await response.json();
    return isJsonRecord(payload) ? payload : {};
  } catch {
    return {};
  }
}

function responseError(payload: JsonRecord, fallback: string) {
  return typeof payload.error === "string" ? payload.error : fallback;
}

export async function refreshEnvironmentSnapshot(): Promise<EnvironmentSnapshot> {
  const response = await fetch("/api/environment/observations", {
    cache: "no-store",
  });
  const payload = await readPayload(response);

  if (!response.ok || !isEnvironmentSnapshot(payload.snapshot)) {
    throw new Error(responseError(payload, "环境数据同步失败"));
  }

  return payload.snapshot;
}

export async function loadWeatherForecast(
  location: string,
  range: ForecastRange,
): Promise<WeatherForecast> {
  const normalizedLocation = location.trim();
  if (!normalizedLocation) {
    throw new Error("请输入监测地点");
  }

  const searchParams = new URLSearchParams({
    location: normalizedLocation,
    days: String(range),
  });
  const response = await fetch(`/api/weather/forecast?${searchParams}`, {
    cache: "no-store",
  });
  const payload = await readPayload(response);

  if (!response.ok || !isWeatherForecast(payload.forecast)) {
    throw new Error(responseError(payload, "天气预报更新失败"));
  }

  return payload.forecast;
}
