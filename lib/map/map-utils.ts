import type { RiskLevel } from "@/lib/map/types";
import { RISK_COLORS } from "@/lib/map/map-config";

export function isValidCoordinate(
  coordinate: { latitude: number; longitude: number } | null | undefined,
): coordinate is { latitude: number; longitude: number } {
  return Boolean(
    coordinate &&
      Number.isFinite(coordinate.latitude) &&
      Number.isFinite(coordinate.longitude) &&
      coordinate.latitude >= -90 &&
      coordinate.latitude <= 90 &&
      coordinate.longitude >= -180 &&
      coordinate.longitude <= 180,
  );
}

export function clampRiskRadius(detectionCount: number) {
  return Math.min(14, Math.max(5, 5 + Math.sqrt(Math.max(0, detectionCount)) * 1.35));
}

export function riskColor(level: RiskLevel) {
  return RISK_COLORS[level];
}

export function formatMapTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function formatCoordinate(value: number) {
  return value.toFixed(5);
}
