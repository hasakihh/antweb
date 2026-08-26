export type MonitoringMode = "live" | "local";
export type StreamStatus = "offline" | "connecting" | "online" | "error";

export interface FieldLocation {
  latitude: number;
  longitude: number;
}

export interface MonitoringSessionState {
  streamStatus: StreamStatus;
  isStreaming: boolean;
  fieldLocation: FieldLocation | null;
}
