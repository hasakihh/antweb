export type PredictionRange = 3 | 7 | 15;
export type DetailTab = "count" | "environment" | "impact" | "lag";

export interface ForecastPoint {
  date: string;
  fullDate: string;
  actual?: number;
  predicted: number;
  lower: number;
  upper: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  pressure: number;
  risk: number;
  lag: number;
}

export interface ModelFactor {
  name: string;
  value: number;
  direction: "increase" | "decrease";
}

export const predictionRanges: PredictionRange[] = [3, 7, 15];

export const historicalPoints: ForecastPoint[] = [
  { date: "08/07", fullDate: "2026-08-07", actual: 94, predicted: 94, lower: 94, upper: 94, temperature: 28.1, humidity: 74, rainfall: 0, pressure: 1006, risk: 38, lag: 86 },
  { date: "08/08", fullDate: "2026-08-08", actual: 101, predicted: 101, lower: 101, upper: 101, temperature: 28.8, humidity: 72, rainfall: 0, pressure: 1005, risk: 43, lag: 94 },
  { date: "08/09", fullDate: "2026-08-09", actual: 98, predicted: 98, lower: 98, upper: 98, temperature: 29.2, humidity: 77, rainfall: 2.6, pressure: 1004, risk: 41, lag: 101 },
  { date: "08/10", fullDate: "2026-08-10", actual: 112, predicted: 112, lower: 112, upper: 112, temperature: 29.7, humidity: 75, rainfall: 0.4, pressure: 1003, risk: 51, lag: 98 },
  { date: "08/11", fullDate: "2026-08-11", actual: 119, predicted: 119, lower: 119, upper: 119, temperature: 30.1, humidity: 71, rainfall: 0, pressure: 1004, risk: 57, lag: 112 },
  { date: "08/12", fullDate: "2026-08-12", actual: 116, predicted: 116, lower: 116, upper: 116, temperature: 29.5, humidity: 78, rainfall: 4.8, pressure: 1002, risk: 55, lag: 119 },
  { date: "08/13", fullDate: "2026-08-13", actual: 126, predicted: 126, lower: 126, upper: 126, temperature: 30.4, humidity: 76, rainfall: 0.2, pressure: 1001, risk: 63, lag: 116 },
];

export const predictionPoints: ForecastPoint[] = [
  { date: "08/14", fullDate: "2026-08-14", predicted: 137, lower: 128, upper: 146, temperature: 30.8, humidity: 77, rainfall: 0, pressure: 1001, risk: 69, lag: 126 },
  { date: "08/15", fullDate: "2026-08-15", predicted: 143, lower: 132, upper: 154, temperature: 31.2, humidity: 75, rainfall: 0, pressure: 1000, risk: 73, lag: 137 },
  { date: "08/16", fullDate: "2026-08-16", predicted: 149, lower: 136, upper: 162, temperature: 31.5, humidity: 78, rainfall: 1.2, pressure: 999, risk: 76, lag: 143 },
  { date: "08/17", fullDate: "2026-08-17", predicted: 146, lower: 132, upper: 160, temperature: 30.3, humidity: 83, rainfall: 8.4, pressure: 998, risk: 72, lag: 149 },
  { date: "08/18", fullDate: "2026-08-18", predicted: 157, lower: 141, upper: 173, temperature: 30.9, humidity: 80, rainfall: 2.1, pressure: 999, risk: 79, lag: 146 },
  { date: "08/19", fullDate: "2026-08-19", predicted: 168, lower: 150, upper: 186, temperature: 31.7, humidity: 76, rainfall: 0, pressure: 1000, risk: 84, lag: 157 },
  { date: "08/20", fullDate: "2026-08-20", predicted: 164, lower: 145, upper: 183, temperature: 30.6, humidity: 82, rainfall: 5.7, pressure: 999, risk: 81, lag: 168 },
  { date: "08/21", fullDate: "2026-08-21", predicted: 171, lower: 150, upper: 192, temperature: 31.1, humidity: 79, rainfall: 1.5, pressure: 1000, risk: 85, lag: 164 },
  { date: "08/22", fullDate: "2026-08-22", predicted: 179, lower: 157, upper: 201, temperature: 31.8, humidity: 75, rainfall: 0, pressure: 1001, risk: 87, lag: 171 },
  { date: "08/23", fullDate: "2026-08-23", predicted: 175, lower: 151, upper: 199, temperature: 30.4, humidity: 84, rainfall: 9.2, pressure: 998, risk: 83, lag: 179 },
  { date: "08/24", fullDate: "2026-08-24", predicted: 188, lower: 162, upper: 214, temperature: 31.3, humidity: 81, rainfall: 2.4, pressure: 999, risk: 89, lag: 175 },
  { date: "08/25", fullDate: "2026-08-25", predicted: 196, lower: 168, upper: 224, temperature: 32.1, humidity: 76, rainfall: 0, pressure: 1000, risk: 91, lag: 188 },
  { date: "08/26", fullDate: "2026-08-26", predicted: 190, lower: 160, upper: 220, temperature: 31.2, humidity: 82, rainfall: 4.6, pressure: 999, risk: 88, lag: 196 },
  { date: "08/27", fullDate: "2026-08-27", predicted: 184, lower: 153, upper: 215, temperature: 30.7, humidity: 85, rainfall: 10.1, pressure: 998, risk: 84, lag: 190 },
  { date: "08/28", fullDate: "2026-08-28", predicted: 181, lower: 149, upper: 213, temperature: 30.9, humidity: 80, rainfall: 1.8, pressure: 1000, risk: 82, lag: 184 },
];

export const modelFactors: ModelFactor[] = [
  { name: "温度", value: 86, direction: "increase" },
  { name: "相对湿度", value: 72, direction: "increase" },
  { name: "降雨量", value: 48, direction: "decrease" },
  { name: "气压", value: 31, direction: "decrease" },
  { name: "风速", value: 38, direction: "decrease" },
  { name: "土壤温度", value: 79, direction: "increase" },
  { name: "土壤湿度", value: 66, direction: "increase" },
  { name: "光照强度", value: 58, direction: "increase" },
  { name: "日照时长", value: 63, direction: "increase" },
  { name: "昼夜温差", value: 42, direction: "decrease" },
  { name: "前 1 日诱集量", value: 92, direction: "increase" },
  { name: "前 3 日均值", value: 89, direction: "increase" },
  { name: "前 7 日均值", value: 81, direction: "increase" },
  { name: "诱集增速", value: 84, direction: "increase" },
  { name: "连续高温天数", value: 74, direction: "increase" },
  { name: "降雨滞后", value: 53, direction: "decrease" },
  { name: "湿度滞后", value: 69, direction: "increase" },
  { name: "季节项", value: 77, direction: "increase" },
];

export const detailTabs: ReadonlyArray<{
  id: DetailTab;
  label: string;
  english: string;
}> = [
  { id: "count", label: "数量预测", english: "COUNT" },
  { id: "environment", label: "未来环境", english: "WEATHER" },
  { id: "impact", label: "环境影响", english: "IMPACT" },
  { id: "lag", label: "滞后效应", english: "LAG" },
];
