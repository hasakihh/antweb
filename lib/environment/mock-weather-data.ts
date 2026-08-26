import type { WeatherCondition } from "@/lib/environment/types";

export const mockWeatherConditions: readonly {
  condition: WeatherCondition;
  label: string;
  humidity: number;
  precipitation: number;
}[] = [
  { condition: "partly-cloudy", label: "多云间晴", humidity: 72, precipitation: 20 },
  { condition: "light-rain", label: "短时阵雨", humidity: 79, precipitation: 55 },
  { condition: "cloudy", label: "阴转多云", humidity: 75, precipitation: 30 },
  { condition: "sunny", label: "晴", humidity: 66, precipitation: 10 },
  { condition: "moderate-rain", label: "中雨", humidity: 84, precipitation: 72 },
];
