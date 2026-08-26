"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Droplets,
  RefreshCw,
  Search,
  Thermometer,
} from "lucide-react";
import type {
  EnvironmentSnapshot,
} from "@/lib/environment/types";
import { downloadObservationsCsv } from "@/components/environment/environment-observation-export";
import {
  filterAndSortObservations,
  formatObservationTime,
  type ObservationSortDirection,
  type ObservationSortKey,
} from "@/components/environment/environment-observation-model";
import styles from "./environment-workspace.module.css";

export function EnvironmentObservationTable({
  snapshot,
  isRefreshing,
  refreshError,
  refresh,
}: {
  snapshot: EnvironmentSnapshot;
  isRefreshing: boolean;
  refreshError: string | null;
  refresh: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<ObservationSortKey>("recordedAt");
  const [sortDirection, setSortDirection] =
    useState<ObservationSortDirection>("descending");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visibleObservations = useMemo(() => {
    return filterAndSortObservations(
      snapshot.observations,
      query,
      sortKey,
      sortDirection,
    );
  }, [query, snapshot.observations, sortDirection, sortKey]);

  function handleSort(nextKey: ObservationSortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) =>
        current === "ascending" ? "descending" : "ascending",
      );
      return;
    }

    setSortKey(nextKey);
    setSortDirection("ascending");
  }

  function toggleAllVisible() {
    const visibleIds = visibleObservations.map((observation) => observation.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  }

  function toggleObservation(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  const allVisibleSelected =
    visibleObservations.length > 0 &&
    visibleObservations.every((observation) =>
      selectedIds.includes(observation.id),
    );

  return (
    <section className={styles.observationSection} aria-labelledby="observation-title">
      <div className={styles.sectionHeading}>
        <div>
          <p>FIELD OBSERVATIONS</p>
          <h2 id="observation-title">田间装置气象数据</h2>
        </div>

        <div className={styles.tableActions}>
          <label className={styles.searchField}>
            <span className={styles.srOnly}>搜索设备ID</span>
            <Search size={13} strokeWidth={1.7} aria-hidden="true" />
            <input
              value={query}
              placeholder="搜索设备ID"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button
            className={styles.iconButton}
            type="button"
            aria-label="同步装置气象数据"
            title="同步装置气象数据"
            disabled={isRefreshing}
            onClick={() => void refresh()}
          >
            <RefreshCw
              className={isRefreshing ? styles.spinning : ""}
              size={14}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </button>
          <button
            className={styles.exportButton}
            type="button"
            onClick={() => downloadObservationsCsv(visibleObservations)}
            disabled={visibleObservations.length === 0}
          >
            <Download size={13} strokeWidth={1.7} aria-hidden="true" />
            导出
          </button>
        </div>
      </div>

      <div className={styles.observationMeta}>
        <div>
          <span data-state="online" />
          {snapshot.observations.length} 条记录
        </div>
        <span>最近同步 {formatObservationTime(snapshot.syncedAt)}</span>
        {selectedIds.length > 0 ? <span>已选择 {selectedIds.length} 条</span> : null}
        {refreshError ? <span className={styles.errorText}>{refreshError}</span> : null}
      </div>

      <div className={styles.tableFrame}>
        <div className={styles.tableScroller}>
          <table>
            <thead>
              <tr>
                <th className={styles.checkboxColumn}>
                  <input
                    type="checkbox"
                    aria-label="选择当前全部气象记录"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                  />
                </th>
                <th className={styles.indexColumn}>序号</th>
                <SortableHeader
                  label="设备ID"
                  column="deviceId"
                  activeColumn={sortKey}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="温度(°C)"
                  column="temperature"
                  activeColumn={sortKey}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="相对湿度(%)"
                  column="relativeHumidity"
                  activeColumn={sortKey}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="气压(hPa)"
                  column="pressure"
                  activeColumn={sortKey}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="服务器记录时间"
                  column="recordedAt"
                  activeColumn={sortKey}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              </tr>
            </thead>
            <tbody>
              {visibleObservations.map((observation, index) => (
                <tr
                  data-selected={
                    selectedIds.includes(observation.id) ? "true" : undefined
                  }
                  key={observation.id}
                >
                  <td className={styles.checkboxColumn}>
                    <input
                      type="checkbox"
                      aria-label={`选择 ${observation.deviceId} 在 ${formatObservationTime(
                        observation.recordedAt,
                      )} 的记录`}
                      checked={selectedIds.includes(observation.id)}
                      onChange={() => toggleObservation(observation.id)}
                    />
                  </td>
                  <td className={styles.indexColumn}>{index + 1}</td>
                  <td><strong>{observation.deviceId}</strong></td>
                  <td>
                    <span className={styles.valueCell} data-metric="temperature">
                      <Thermometer size={12} aria-hidden="true" />
                      {observation.temperature.toFixed(1)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.valueCell} data-metric="humidity">
                      <Droplets size={12} aria-hidden="true" />
                      {observation.relativeHumidity}
                    </span>
                  </td>
                  <td>{observation.pressure.toFixed(1)}</td>
                  <td><time dateTime={observation.recordedAt}>{formatObservationTime(observation.recordedAt)}</time></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleObservations.length === 0 ? (
          <div className={styles.emptyRows}>没有匹配的设备记录</div>
        ) : null}
      </div>
    </section>
  );
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: ObservationSortDirection;
}) {
  if (!active) {
    return <ArrowUpDown size={12} strokeWidth={1.6} aria-hidden="true" />;
  }

  return direction === "ascending" ? (
    <ArrowUp size={12} strokeWidth={1.8} aria-hidden="true" />
  ) : (
    <ArrowDown size={12} strokeWidth={1.8} aria-hidden="true" />
  );
}

function SortableHeader({
  label,
  column,
  activeColumn,
  direction,
  onSort,
}: {
  label: string;
  column: ObservationSortKey;
  activeColumn: ObservationSortKey;
  direction: ObservationSortDirection;
  onSort: (column: ObservationSortKey) => void;
}) {
  const isActive = activeColumn === column;

  return (
    <th aria-sort={isActive ? direction : "none"}>
      <button type="button" onClick={() => onSort(column)}>
        {label}
        <SortIcon active={isActive} direction={direction} />
      </button>
    </th>
  );
}
