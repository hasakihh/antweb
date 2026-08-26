export type MonitoringMode = "live" | "local";
export type StreamStatus = "offline" | "connecting" | "online" | "error";

export interface LiveDetectionRecord {
  id: string;
  imageUrl: string;
  detectedCount: number;
  correctedCount: number | null;
  capturedAt: string;
  reviewStatus: "pending" | "reviewed";
}

export interface LocalDetectionDraft {
  id: string;
  imageUrl: string;
  modelSpecies: string;
  modelCount: number;
  confidence: number;
  correctedSpecies: string;
  correctedCount: number;
  reviewStatus: "pending" | "approved";
}

export interface ReviewedDetectionRecord {
  id: string;
  imageUrl: string;
  species: string;
  count: number;
  longitude: number;
  latitude: number;
  temperature: number;
  relativeHumidity: number;
  pressure: number;
  recordedAt: string;
}
