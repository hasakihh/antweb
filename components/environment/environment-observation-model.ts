import type { FieldObservation } from "@/lib/environment/types";

export type ObservationSortKey =
  | "deviceId"
  | "temperature"
  | "relativeHumidity"
  | "pressure"
  | "recordedAt";
export type ObservationSortDirection = "ascending" | "descending";

export function formatObservationTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function filterAndSortObservations(
  observations: FieldObservation[],
  query: string,
  sortKey: ObservationSortKey,
  sortDirection: ObservationSortDirection,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filtered = normalizedQuery
    ? observations.filter((observation) =>
        observation.deviceId
          .toLocaleLowerCase("zh-CN")
          .includes(normalizedQuery),
      )
    : observations;

  return [...filtered].sort((left, right) => {
    let result: number;

    if (sortKey === "deviceId") {
      result = left.deviceId.localeCompare(right.deviceId, "zh-CN");
    } else if (sortKey === "recordedAt") {
      result =
        new Date(left.recordedAt).getTime() -
        new Date(right.recordedAt).getTime();
    } else {
      result = left[sortKey] - right[sortKey];
    }

    return sortDirection === "ascending" ? result : -result;
  });
}
