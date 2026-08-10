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

const antCounts = [
  { date: "08/01", count: 34 },
  { date: "08/02", count: 48 },
  { date: "08/03", count: 42 },
  { date: "08/04", count: 71 },
  { date: "08/05", count: 64 },
  { date: "08/06", count: 92 },
  { date: "08/07", count: 78 },
  { date: "08/08", count: 113 },
  { date: "08/09", count: 101 },
  { date: "08/10", count: 126 },
];

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
          <h2 id="trend-title">小火蚁数量趋势</h2>
        </div>
        <span className="demo-label">演示数据</span>
      </div>

      <div className="trend-summary">
        <div className="current-count">
          <span>当前样本</span>
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
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.10)" strokeDasharray="3 6" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              interval={1}
              tick={{ fill: "#848484", fontSize: 10 }}
              dy={9}
            />
            <YAxis
              width={46}
              domain={[0, 160]}
              ticks={[0, 40, 80, 120, 160]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#848484", fontSize: 10 }}
              label={{ value: "数量 / 只", angle: -90, position: "insideLeft", fill: "#6f6f6f", fontSize: 9 }}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.22)", strokeDasharray: "3 4" }}
              contentStyle={{
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 4,
                color: "#f2f2ed",
                fontSize: 11,
              }}
              labelStyle={{ color: "#9b9b96", marginBottom: 4 }}
              formatter={(value) => [`${value} 只`, "小火蚁"]}
            />
            <Line
              className="trend-line"
              type="monotone"
              dataKey="count"
              stroke="#f2f2ed"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#090909", stroke: "#ffffff", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={900}
            />
            <ReferenceLine
              x={activeSample.date}
              stroke="rgba(255,255,255,0.24)"
              strokeDasharray="3 5"
            />
            <ReferenceDot
              x={activeSample.date}
              y={activeSample.count}
              r={5}
              fill="#090909"
              stroke="#ffffff"
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
