import "client-only";

import type {
  EnvironmentSnapshot,
  ForecastRange,
  WeatherForecast,
} from "@/lib/environment/types";
import {
  isEnvironmentSnapshot,
  isJsonRecord,
  isWeatherForecast,
  type JsonRecord,
} from "@/lib/environment/environment-contract";

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
