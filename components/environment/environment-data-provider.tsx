"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { refreshEnvironmentSnapshot } from "@/lib/environment/environment-data-client";
import type { EnvironmentSnapshot } from "@/lib/environment/types";

interface EnvironmentDataContextValue {
  snapshot: EnvironmentSnapshot;
  isRefreshing: boolean;
  refreshError: string | null;
  refresh: () => Promise<void>;
}

const EnvironmentDataContext = createContext<EnvironmentDataContextValue | null>(
  null,
);

export function EnvironmentDataProvider({
  children,
  initialSnapshot,
}: {
  children: ReactNode;
  initialSnapshot: EnvironmentSnapshot;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const refreshInFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshInFlightRef.current) return;

    refreshInFlightRef.current = true;
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      setSnapshot(await refreshEnvironmentSnapshot());
    } catch (error) {
      setRefreshError(
        error instanceof Error ? error.message : "环境数据同步失败",
      );
    } finally {
      refreshInFlightRef.current = false;
      setIsRefreshing(false);
    }
  }, []);

  const value = useMemo(
    () => ({ snapshot, isRefreshing, refreshError, refresh }),
    [isRefreshing, refresh, refreshError, snapshot],
  );

  return (
    <EnvironmentDataContext.Provider value={value}>
      {children}
    </EnvironmentDataContext.Provider>
  );
}

export function useEnvironmentData() {
  const context = useContext(EnvironmentDataContext);
  if (!context) {
    throw new Error(
      "useEnvironmentData must be used inside EnvironmentDataProvider",
    );
  }
  return context;
}
