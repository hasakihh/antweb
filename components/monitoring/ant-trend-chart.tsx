"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { landingTrendData } from "@/lib/monitoring/monitoring-overview-data";

const antCounts = landingTrendData;

export function AntTrendChart() {
  const [activeIndex, setActiveIndex] = useState(5);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current >= antCounts.length - 1 ? 5 : current + 1));
    }, 1800);

    return () => window.clearInterval(timer);
  }, []);

  const activeSample = antCounts[activeIndex];
  const previousSample = antCounts[Math.max(0, activeIndex - 1)];
  const trend = useMemo(() => {
    const change = ((activeSample.count - previousSample.count) / previousSample.count) * 100;
    return Math.round(change);
  }, [activeSample, previousSample]);

  return (
    <section className="trend-panel" aria-labelledby="trend-title">
      <div className="trend-heading">
        <div>
          <p>FIELD TREND / 10 DAYS</p>
          <h2 id="trend-title">Trend-summary</h2>
        </div>
      </div>

      <div className="trend-summary">
        <div className="current-count">
          <strong>{activeSample.count}</strong>
          <small>只 / 日</small>
        </div>
        <dl>
          <div>
            <dt>日期</dt>
            <dd>{activeSample.date}</dd>
          </div>
          <div>
            <dt>日变化</dt>
            <dd className={trend >= 0 ? "trend-up" : "trend-down"}>
              {trend > 0 ? "+" : ""}{trend}%
            </dd>
          </div>
        </dl>
      </div>

      <div className="chart-frame">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={antCounts} margin={{ top: 12, right: 10, bottom: 4, left: -18 }}>
            <CartesianGrid vertical={false} stroke="var(--trend-grid)" strokeDasharray="3 6" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              interval={1}
              tick={{ fill: "var(--trend-tick)", fontSize: 10 }}
              dy={9}
            />
            <YAxis
              width={46}
              domain={[0, 160]}
              ticks={[0, 40, 80, 120, 160]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--trend-tick)", fontSize: 10 }}
              label={{ value: "数量 / 只", angle: -90, position: "insideLeft", fill: "var(--trend-axis-label)", fontSize: 9 }}
            />
            <Tooltip
              cursor={{ stroke: "var(--trend-cursor)", strokeDasharray: "3 4" }}
              contentStyle={{
                background: "var(--trend-tooltip-bg)",
                border: "1px solid var(--trend-tooltip-border)",
                borderRadius: 4,
                color: "var(--trend-tooltip-text)",
                fontSize: 11,
              }}
              labelStyle={{ color: "var(--trend-tooltip-label)", marginBottom: 4 }}
              formatter={(value) => [`${value} 只`, "小火蚁"]}
            />
            <Line
              className="trend-line"
              type="monotone"
              dataKey="count"
              stroke="var(--trend-line)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--trend-marker-fill)", stroke: "var(--trend-marker-stroke)", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={900}
            />
            <ReferenceLine
              x={activeSample.date}
              stroke="var(--trend-reference)"
              strokeDasharray="3 5"
            />
            <ReferenceDot
              x={activeSample.date}
              y={activeSample.count}
              r={5}
              fill="var(--trend-marker-fill)"
              stroke="var(--trend-marker-stroke)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-axis-caption" aria-hidden="true">
        <span>日期</span>
        <span>峰值 126 只</span>
      </div>
    </section>
  );
}
