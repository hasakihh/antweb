import type {
  ForecastRange,
  WeatherCondition,
  WeatherForecast,
  WeatherForecastDay,
} from "@/lib/environment/types";

export const DEFAULT_WEATHER_LOCATION = "广东省广州市从化区";

export interface WeatherForecastProvider {
  getForecast(
    location: string,
    range: ForecastRange,
  ): Promise<WeatherForecast>;
}

const conditions: Array<{
  condition: WeatherCondition;
  label: string;
  humidity: number;
  precipitation: number;
}> = [
  {
    condition: "partly-cloudy",
    label: "多云间晴",
    humidity: 72,
    precipitation: 20,
  },
  {
    condition: "light-rain",
    label: "短时阵雨",
    humidity: 79,
    precipitation: 55,
  },
  {
    condition: "cloudy",
    label: "阴转多云",
    humidity: 75,
    precipitation: 30,
  },
  {
    condition: "sunny",
    label: "晴",
    humidity: 66,
    precipitation: 10,
  },
  {
    condition: "moderate-rain",
    label: "中雨",
    humidity: 84,
    precipitation: 72,
  },
];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createMockForecastDay(index: number, date: Date): WeatherForecastDay {
  const weather = conditions[index % conditions.length];
  const temperatureOffset = [0, -1, 1, 2, -2][index % 5];

  return {
    date: dateKey(date),
    weekday: new Intl.DateTimeFormat("zh-CN", {
      weekday: "short",
    }).format(date),
    condition: weather.condition,
    conditionLabel: weather.label,
    temperatureMin: 23 + temperatureOffset,
    temperatureMax: 31 + temperatureOffset,
    relativeHumidity: weather.humidity + (index % 3) - 1,
    precipitationProbability: weather.precipitation,
    windDirection: index % 2 === 0 ? "东南风" : "偏南风",
    windScale: `${2 + (index % 2)}级`,
    pressure: 1005 + ((index * 3) % 7),
  };
}

class MockWeatherForecastProvider implements WeatherForecastProvider {
  async getForecast(
    location: string,
    range: ForecastRange,
  ): Promise<WeatherForecast> {
    const start = new Date();
    start.setHours(12, 0, 0, 0);

    return {
      location,
      range,
      updatedAt: new Date().toISOString(),
      source: "mock",
      days: Array.from({ length: range }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return createMockForecastDay(index, date);
      }),
    };
  }
}

const provider: WeatherForecastProvider = new MockWeatherForecastProvider();

export function getWeatherForecastProvider(): WeatherForecastProvider {
  // The QWeather adapter only needs to implement this provider interface.
  // The page and /api/weather/forecast contract will not need to change.
  return provider;
}

export async function getWeatherForecast(
  location: string,
  range: ForecastRange,
) {
  return getWeatherForecastProvider().getForecast(location, range);
}

