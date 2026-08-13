import { getWeatherForecast } from "@/lib/environment/weather-service";
import type { ForecastRange } from "@/lib/environment/types";

const supportedRanges = new Set<ForecastRange>([3, 7, 15]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location")?.trim().slice(0, 48) ?? "";
  const requestedRange = Number(searchParams.get("days") ?? 7);

  if (!location) {
    return Response.json({ error: "请输入监测地点" }, { status: 400 });
  }

  if (!supportedRanges.has(requestedRange as ForecastRange)) {
    return Response.json(
      { error: "仅支持 3、7 或 15 日预报" },
      { status: 400 },
    );
  }

  const forecast = await getWeatherForecast(
    location,
    requestedRange as ForecastRange,
  );

  return Response.json({ forecast });
}

