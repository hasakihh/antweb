import "client-only";

import type { FieldObservation } from "@/lib/environment/types";

function serializeObservations(observations: FieldObservation[]) {
  const rows = observations.map((observation, index) => [
    index + 1,
    observation.deviceId,
    observation.temperature,
    observation.relativeHumidity,
    observation.pressure,
    observation.recordedAt,
  ]);

  return [
    ["序号", "设备ID", "温度(°C)", "相对湿度(%)", "气压(hPa)", "服务器记录时间"],
    ...rows,
  ]
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
}

export function downloadObservationsCsv(observations: FieldObservation[]) {
  const blob = new Blob([`\uFEFF${serializeObservations(observations)}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `environment-observations-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
