"use client";

import { useCallback, useState } from "react";
import type { FieldLocation, MonitoringSessionState, StreamStatus } from "@/components/monitoring/monitoring-types";

export function useMonitoringSession() {
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("offline");
  const [fieldLocation, setFieldLocation] = useState<FieldLocation | null>(null);

  const startStreaming = useCallback(() => {
    setStreamStatus("connecting");
  }, []);

  const stopStreaming = useCallback(() => {
    setStreamStatus("offline");
  }, []);

  const state: MonitoringSessionState = {
    streamStatus,
    isStreaming: streamStatus === "connecting" || streamStatus === "online",
    fieldLocation,
  };

  return {
    ...state,
    setFieldLocation,
    startStreaming,
    stopStreaming,
  };
}
