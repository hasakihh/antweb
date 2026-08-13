"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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

  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setRefreshError(null);

    try {
      const response = await fetch("/api/environment/observations", {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("环境数据同步失败");

      const payload = (await response.json()) as {
        snapshot: EnvironmentSnapshot;
      };
      setSnapshot(payload.snapshot);
    } catch (error) {
      setRefreshError(
        error instanceof Error ? error.message : "环境数据同步失败",
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

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

