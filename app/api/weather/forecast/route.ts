import { getWeatherForecast } from "@/lib/environment/weather-service";
import { isWeatherForecast } from "@/lib/environment/environment-contract";
import { errorMessage, jsonError } from "@/lib/http/route-response";
import type { ForecastRange } from "@/lib/environment/types";

const supportedRanges = new Set<ForecastRange>([3, 7, 15]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location")?.trim().slice(0, 48) ?? "";
  const requestedRange = Number(searchParams.get("days") ?? 7);

  if (!location) {
    return jsonError("请输入监测地点", 400);
  }

  if (!supportedRanges.has(requestedRange as ForecastRange)) {
    return jsonError("仅支持 3、7 或 15 日预报", 400);
  }

  try {
    const forecast = await getWeatherForecast(
      location,
      requestedRange as ForecastRange,
    );
    if (!isWeatherForecast(forecast)) {
      return jsonError("天气预报数据格式无效", 502);
    }

    return Response.json({ forecast });
  } catch (error) {
    return jsonError(errorMessage(error, "天气预报更新失败"));
  }
}
