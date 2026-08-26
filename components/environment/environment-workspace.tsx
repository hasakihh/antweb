"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  MapPin,
  Sun,
  Wind,
} from "lucide-react";
import { useEnvironmentData } from "@/components/environment/environment-data-provider";
import { EnvironmentObservationTable } from "@/components/environment/environment-observation-table";
import { loadWeatherForecast } from "@/lib/environment/environment-data-client";
import type { ForecastRange, WeatherCondition, WeatherForecast } from "@/lib/environment/types";
import styles from "./environment-workspace.module.css";

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

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
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
  const forecastRequestInFlightRef = useRef(false);

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

      <EnvironmentObservationTable
        snapshot={snapshot}
        isRefreshing={isRefreshing}
        refreshError={refreshError}
        refresh={refresh}
      />
    </div>
  );
}
