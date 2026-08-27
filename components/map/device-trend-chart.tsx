"use client";

import type { DeviceTrendPoint } from "@/lib/map/types";
import styles from "./map-workspace.module.css";

export function DeviceTrendChart({ points }: { points: readonly DeviceTrendPoint[] }) {
  if (points.length === 0) {
    return <p className={styles.popupEmptyTrend}>暂无数量趋势</p>;
  }

  const max = Math.max(...points.map((point) => point.count), 1);
  const coordinates = points
    .map((point, index) => {
      const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
      const y = 30 - (point.count / max) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={styles.trendChart} aria-label="设备数量趋势图">
      <svg viewBox="0 0 100 32" role="img" aria-hidden="true" preserveAspectRatio="none">
        <polyline points={coordinates} fill="none" stroke="currentColor" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        {points.map((point, index) => {
          const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
          const y = 30 - (point.count / max) * 24;
          return <circle cx={x} cy={y} r="1.7" fill="currentColor" key={`${point.label}-${index}`} />;
        })}
      </svg>
      <div className={styles.trendLabels}>
        <span>{points[0]?.label}</span>
        <strong>{points[points.length - 1]?.count} 只</strong>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
