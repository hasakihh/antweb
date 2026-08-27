export type CoordinateSource = "gps" | "manual";

export type DeviceStatus = "online" | "offline";

export type RiskLevel = "low" | "medium" | "high" | "review";

export interface MapCoordinate {
  latitude: number;
  longitude: number;
  source: CoordinateSource;
  locatedAt: string;
}

export interface DeviceTrendPoint {
  label: string;
  count: number;
}

export interface DeviceLocation {
  id: string;
  name: string;
  status: DeviceStatus;
  coordinate: MapCoordinate | null;
  trend: readonly DeviceTrendPoint[];
}

export interface RiskOccurrence {
  id: string;
  source: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  detectionCount: number;
  riskLevel: RiskLevel;
  detectedAt: string;
}

export interface MapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface RiskGrid {
  id: string;
  bounds: MapBounds;
  center: {
    latitude: number;
    longitude: number;
  };
  detectionCount: number;
  positiveCount: number;
  riskScore: number;
  latestDetectedAt: string;
  trend: "rising" | "stable" | "falling";
  riskLevel: RiskLevel;
  needsAlert: boolean;
}

export interface RiskAlert {
  id: string;
  title: string;
  riskScore: number;
  positiveCount: number;
  gridId: string;
}

export interface MapOverview {
  detectionTotal: number;
  positiveTotal: number;
  highRiskAreaCount: number;
  missingLocationCount: number;
}

export interface MapSnapshot {
  updatedAt: string;
  center: {
    latitude: number;
    longitude: number;
  };
  devices: readonly DeviceLocation[];
  occurrences: readonly RiskOccurrence[];
  grids: readonly RiskGrid[];
  overview: MapOverview;
  alerts: readonly RiskAlert[];
}
