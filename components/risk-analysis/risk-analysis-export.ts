import "client-only";

import type {
  ForecastPoint,
  PredictionRange,
} from "@/components/risk-analysis/risk-analysis-data";

export function downloadRiskForecast(
  forecast: ForecastPoint[],
  range: PredictionRange,
) {
  const header = ["日期", "预测数量", "预测下限", "预测上限", "温度", "相对湿度", "降雨量", "风险概率"];
  const rows = forecast.map((point) => [
    point.fullDate,
    point.predicted,
    point.lower,
    point.upper,
    point.temperature,
    point.humidity,
    point.rainfall,
    `${point.risk}%`,
  ]);
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `fire-ant-risk-${range}d.csv`;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
