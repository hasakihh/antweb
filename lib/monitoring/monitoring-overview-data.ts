import type { EnvironmentSnapshot } from "@/lib/environment/types";

export type MonitoringRange = "day" | "week" | "month" | "year";

export interface MonitoringTrendPoint {
  label: string;
  antCount: number;
  temperature: number;
  humidity: number;
}

export interface MonitoringOverview {
  antCount: number;
  antCountDelta: number;
  latestRecordedAt: string;
  riskScore: number;
  temperature: number;
  humidity: number;
  temperatureDelta: number | null;
  humidityDelta: number | null;
  trendData: Record<MonitoringRange, readonly MonitoringTrendPoint[]>;
}

export const monitoringTrendData: Record<MonitoringRange, readonly MonitoringTrendPoint[]> = {
  day: [
    { label: "00:00", antCount: 18, temperature: 24.1, humidity: 77 },
    { label: "03:00", antCount: 24, temperature: 23.7, humidity: 79 },
    { label: "06:00", antCount: 31, temperature: 24.6, humidity: 76 },
    { label: "09:00", antCount: 55, temperature: 27.2, humidity: 69 },
    { label: "12:00", antCount: 74, temperature: 29.1, humidity: 62 },
    { label: "15:00", antCount: 98, temperature: 28.6, humidity: 64 },
    { label: "18:00", antCount: 112, temperature: 27.4, humidity: 68 },
    { label: "21:00", antCount: 126, temperature: 26.4, humidity: 71 },
  ],
  week: [
    { label: "周一", antCount: 62, temperature: 25.2, humidity: 74 },
    { label: "周二", antCount: 78, temperature: 26.1, humidity: 72 },
    { label: "周三", antCount: 71, temperature: 25.8, humidity: 75 },
    { label: "周四", antCount: 94, temperature: 27.3, humidity: 68 },
    { label: "周五", antCount: 88, temperature: 28.1, humidity: 65 },
    { label: "周六", antCount: 117, temperature: 27.6, humidity: 67 },
    { label: "周日", antCount: 126, temperature: 26.4, humidity: 71 },
  ],
  month: [
    { label: "08/01", antCount: 44, temperature: 25.1, humidity: 76 },
    { label: "08/04", antCount: 58, temperature: 25.8, humidity: 73 },
    { label: "08/07", antCount: 53, temperature: 26.4, humidity: 71 },
    { label: "08/10", antCount: 79, temperature: 27.8, humidity: 66 },
    { label: "08/13", antCount: 91, temperature: 28.4, humidity: 63 },
    { label: "08/16", antCount: 84, temperature: 27.1, humidity: 69 },
    { label: "08/19", antCount: 103, temperature: 28.7, humidity: 62 },
    { label: "08/22", antCount: 96, temperature: 27.9, humidity: 65 },
    { label: "08/25", antCount: 118, temperature: 27.2, humidity: 68 },
    { label: "08/28", antCount: 126, temperature: 26.4, humidity: 71 },
  ],
  year: [
    { label: "9月", antCount: 41, temperature: 24.3, humidity: 78 },
    { label: "10月", antCount: 49, temperature: 23.8, humidity: 76 },
    { label: "11月", antCount: 38, temperature: 22.9, humidity: 73 },
    { label: "12月", antCount: 35, temperature: 21.7, humidity: 71 },
    { label: "1月", antCount: 46, temperature: 22.4, humidity: 72 },
    { label: "2月", antCount: 57, temperature: 23.6, humidity: 74 },
    { label: "3月", antCount: 69, temperature: 24.8, humidity: 76 },
    { label: "4月", antCount: 81, temperature: 26.2, humidity: 72 },
    { label: "5月", antCount: 97, temperature: 27.5, humidity: 67 },
    { label: "6月", antCount: 112, temperature: 28.3, humidity: 64 },
    { label: "7月", antCount: 119, temperature: 27.7, humidity: 66 },
    { label: "8月", antCount: 126, temperature: 26.4, humidity: 71 },
  ],
};

export const defaultMonitoringOverview: MonitoringOverview = {
  antCount: 126,
  antCountDelta: 18,
  latestRecordedAt: "21:00",
  riskScore: 62,
  temperature: 26.4,
  humidity: 71,
  temperatureDelta: 0.6,
  humidityDelta: -2,
  trendData: monitoringTrendData,
};

export function createMonitoringOverview(
  snapshot?: Pick<EnvironmentSnapshot, "latest" | "temperatureDelta" | "humidityDelta">,
): MonitoringOverview {
  if (!snapshot?.latest) return defaultMonitoringOverview;

  return {
    ...defaultMonitoringOverview,
    temperature: snapshot.latest.temperature,
    humidity: snapshot.latest.relativeHumidity,
    temperatureDelta: snapshot.temperatureDelta,
    humidityDelta: snapshot.humidityDelta,
    latestRecordedAt: new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(snapshot.latest.recordedAt)),
  };
}
