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

export function validateCoordinateInput(latitudeInput: string, longitudeInput: string) {
  const latitude = Number(latitudeInput);
  const longitude = Number(longitudeInput);
  const errors: { latitude?: string; longitude?: string } = {};

  if (latitudeInput.trim() === "" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = "纬度需在 -90 到 90 之间";
  }

  if (longitudeInput.trim() === "" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = "经度需在 -180 到 180 之间";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    latitude,
    longitude,
    errors,
  };
}
