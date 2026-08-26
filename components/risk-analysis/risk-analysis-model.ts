import {
  historicalPoints,
  predictionPoints,
  type ForecastPoint,
  type PredictionRange,
} from "@/components/risk-analysis/risk-analysis-data";

const emptyForecastPoint: ForecastPoint = {
  date: "--",
  fullDate: "",
  predicted: 0,
  lower: 0,
  upper: 0,
  temperature: 0,
  humidity: 0,
  rainfall: 0,
  pressure: 0,
  risk: 0,
  lag: 0,
};

function highestBy(
  points: ForecastPoint[],
  value: (point: ForecastPoint) => number,
) {
  if (points.length === 0) return emptyForecastPoint;

  return points.reduce((highest, point) =>
    value(point) > value(highest) ? point : highest,
  );
}

export function buildRiskAnalysisView(
  range: PredictionRange,
  selectedDate?: string,
) {
  const visibleForecast = predictionPoints.slice(0, range);
  const highestRiskPoint = highestBy(visibleForecast, (point) => point.risk);
  const peakPoint = highestBy(visibleForecast, (point) => point.predicted);

  return {
    visibleForecast,
    hasForecast: visibleForecast.length > 0,
    trendData: [...historicalPoints, ...visibleForecast],
    highestRiskPoint,
    peakPoint,
    summary: {
      effectiveRecords: 126,
      averageCount: 109,
      highestCount: 126,
      highDensityCount: 18,
      rapidGrowthCount: 6,
      netChange: 38,
      intervalChange: 18,
      trainingCutoff: "08/13",
    },
    selectedPoint:
      visibleForecast.find((point) => point.fullDate === selectedDate) ??
      highestRiskPoint,
  };
}

export function defaultRiskDate(range: PredictionRange) {
  return buildRiskAnalysisView(range).highestRiskPoint.fullDate;
}

export function riskLabel(risk: number) {
  if (risk >= 85) return "高风险";
  if (risk >= 65) return "中高风险";
  return "中风险";
}

export function riskLevel(risk: number) {
  if (risk >= 85) return "high";
  if (risk >= 65) return "elevated";
  return "medium";
}
