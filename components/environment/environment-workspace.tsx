"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Cloud,
  CloudRain,
  CloudSun,
  Download,
  Droplets,
  Gauge,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { useEnvironmentData } from "@/components/environment/environment-data-provider";
import { loadWeatherForecast } from "@/lib/environment/environment-data-client";
import type {
  FieldObservation,
  ForecastRange,
  WeatherCondition,
  WeatherForecast,
} from "@/lib/environment/types";
import styles from "./environment-workspace.module.css";

type SortKey =
  | "deviceId"
  | "temperature"
  | "relativeHumidity"
  | "pressure"
  | "recordedAt";
type SortDirection = "ascending" | "descending";

const forecastRanges: ForecastRange[] = [3, 7, 15];

const weatherIcons: Record<
  WeatherCondition,
  typeof Sun
> = {
  sunny: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  "light-rain": CloudRain,
  "moderate-rain": CloudRain,
};

function formatForecastDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value}T12:00:00`));
}

function formatRecordedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function compareObservations(
  left: FieldObservation,
  right: FieldObservation,
  key: SortKey,
) {
  if (key === "deviceId") {
    return left.deviceId.localeCompare(right.deviceId, "zh-CN");
  }

  if (key === "recordedAt") {
    return (
      new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime()
    );
  }

  return left[key] - right[key];
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
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

export function EnvironmentWorkspace({
  initialForecast,
}: {
  initialForecast: WeatherForecast;
}) {
  const { snapshot, isRefreshing, refreshError, refresh } =
    useEnvironmentData();
  const [forecast, setForecast] = useState(initialForecast);
  const [forecastRange, setForecastRange] = useState<ForecastRange>(
    initialForecast.range,
  );
  const [locationInput, setLocationInput] = useState(initialForecast.location);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recordedAt");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("descending");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const forecastRequestInFlightRef = useRef(false);

  const visibleObservations = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
    const filtered = normalizedQuery
      ? snapshot.observations.filter((observation) =>
          observation.deviceId.toLocaleLowerCase("zh-CN").includes(normalizedQuery),
        )
      : snapshot.observations;

    return [...filtered].sort((left, right) => {
      const result = compareObservations(left, right, sortKey);
      return sortDirection === "ascending" ? result : -result;
    });
  }, [query, snapshot.observations, sortDirection, sortKey]);

  async function loadForecast(
    nextRange: ForecastRange,
    nextLocation: string,
  ) {
    if (forecastRequestInFlightRef.current) return;

    forecastRequestInFlightRef.current = true;
    setIsForecastLoading(true);
    setForecastError(null);

    try {
      const nextForecast = await loadWeatherForecast(nextLocation, nextRange);
      setForecast(nextForecast);
      setForecastRange(nextForecast.range);
    } catch (error) {
      setForecastError(
        error instanceof Error ? error.message : "天气预报更新失败",
      );
    } finally {
      forecastRequestInFlightRef.current = false;
      setIsForecastLoading(false);
    }
  }

  function handleLocationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadForecast(forecastRange, locationInput);
  }

  function handleSort(nextKey: SortKey) {
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

  function exportCsv() {
    const rows = visibleObservations.map((observation, index) => [
      index + 1,
      observation.deviceId,
      observation.temperature,
      observation.relativeHumidity,
      observation.pressure,
      observation.recordedAt,
    ]);
    const content = [
      ["序号", "设备ID", "温度(°C)", "相对湿度(%)", "气压(hPa)", "服务器记录时间"],
      ...rows,
    ]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${content}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `environment-observations-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const allVisibleSelected =
    visibleObservations.length > 0 &&
    visibleObservations.every((observation) =>
      selectedIds.includes(observation.id),
    );

  return (
    <div className={styles.workspace}>
      <section className={styles.forecastSection} aria-labelledby="forecast-title">
        <div className={styles.sectionHeading}>
          <div>
            <p>LOCAL FORECAST</p>
            <h2 id="forecast-title">监测地点天气预报</h2>
          </div>

          <form className={styles.locationForm} onSubmit={handleLocationSubmit}>
            <label className={styles.srOnly} htmlFor="forecast-location">
              监测地点
            </label>
            <MapPin size={14} strokeWidth={1.6} aria-hidden="true" />
            <input
              id="forecast-location"
              value={locationInput}
              maxLength={48}
              onChange={(event) => setLocationInput(event.target.value)}
            />
            <button type="submit" disabled={isForecastLoading}>
              {isForecastLoading ? "更新中" : "设置"}
            </button>
          </form>
        </div>

        <div className={styles.forecastToolbar}>
          <div className={styles.rangeControl} aria-label="天气预报天数">
            {forecastRanges.map((range) => (
              <button
                type="button"
                aria-pressed={forecastRange === range}
                className={forecastRange === range ? styles.activeRange : ""}
                disabled={isForecastLoading}
                onClick={() => void loadForecast(range, forecast.location)}
                key={range}
              >
                {range}日
              </button>
            ))}
          </div>

          <div className={styles.forecastMeta}>
            <span>{forecast.location}</span>
            <span>更新于 {formatUpdatedAt(forecast.updatedAt)}</span>
            <span data-source={forecast.source}>
              {forecast.source === "mock" ? "模拟预报" : "和风天气"}
            </span>
          </div>
        </div>

        {forecastError ? (
          <p className={styles.inlineError} role="alert">
            {forecastError}
          </p>
        ) : null}

        <div className={styles.forecastScroller}>
          <div
            className={`${styles.forecastGrid} ${
              isForecastLoading ? styles.loading : ""
            }`}
          >
            {forecast.days.map((day, index) => {
              const WeatherIcon = weatherIcons[day.condition];

              return (
                <article className={styles.forecastDay} key={day.date}>
                  <header>
                    <div>
                      <strong>{index === 0 ? "今天" : day.weekday}</strong>
                      <span>{formatForecastDate(day.date)}</span>
                    </div>
                    <WeatherIcon size={22} strokeWidth={1.45} aria-hidden="true" />
                  </header>

                  <div className={styles.weatherCondition}>
                    <strong>
                      {day.temperatureMax}°
                      <small>{day.temperatureMin}°</small>
                    </strong>
                    <span>{day.conditionLabel}</span>
                  </div>

                  <dl className={styles.weatherDetails}>
                    <div>
                      <dt><Droplets size={11} aria-hidden="true" />湿度</dt>
                      <dd>{day.relativeHumidity}%</dd>
                    </div>
                    <div>
                      <dt><CloudRain size={11} aria-hidden="true" />降雨</dt>
                      <dd>{day.precipitationProbability}%</dd>
                    </div>
                    <div>
                      <dt><Wind size={11} aria-hidden="true" />风力</dt>
                      <dd>{day.windDirection} {day.windScale}</dd>
                    </div>
                    <div>
                      <dt><Gauge size={11} aria-hidden="true" />气压</dt>
                      <dd>{day.pressure} hPa</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </div>
      </section>

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
              onClick={exportCsv}
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
          <span>最近同步 {formatRecordedAt(snapshot.syncedAt)}</span>
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
                        aria-label={`选择 ${observation.deviceId} 在 ${formatRecordedAt(
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
                    <td><time dateTime={observation.recordedAt}>{formatRecordedAt(observation.recordedAt)}</time></td>
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
    </div>
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
  column: SortKey;
  activeColumn: SortKey;
  direction: SortDirection;
  onSort: (column: SortKey) => void;
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
