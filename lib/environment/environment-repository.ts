import type {
  EnvironmentSnapshot,
  FieldObservation,
} from "@/lib/environment/types";

export interface EnvironmentRepository {
  getSnapshot(): Promise<EnvironmentSnapshot>;
}

const mockObservations: FieldObservation[] = [
  {
    id: "obs-0812-2100-a01",
    deviceId: "ANTV-A01",
    temperature: 26.4,
    relativeHumidity: 71,
    pressure: 1007.2,
    recordedAt: "2026-08-12T21:00:00+08:00",
  },
  {
    id: "obs-0812-2058-b03",
    deviceId: "ANTV-B03",
    temperature: 25.9,
    relativeHumidity: 74,
    pressure: 1007.8,
    recordedAt: "2026-08-12T20:58:00+08:00",
  },
  {
    id: "obs-0812-2056-c02",
    deviceId: "ANTV-C02",
    temperature: 27.1,
    relativeHumidity: 68,
    pressure: 1006.9,
    recordedAt: "2026-08-12T20:56:00+08:00",
  },
  {
    id: "obs-0812-2000-a01",
    deviceId: "ANTV-A01",
    temperature: 25.8,
    relativeHumidity: 73,
    pressure: 1007.6,
    recordedAt: "2026-08-12T20:00:00+08:00",
  },
  {
    id: "obs-0812-1958-b03",
    deviceId: "ANTV-B03",
    temperature: 25.4,
    relativeHumidity: 76,
    pressure: 1008.1,
    recordedAt: "2026-08-12T19:58:00+08:00",
  },
  {
    id: "obs-0812-1956-c02",
    deviceId: "ANTV-C02",
    temperature: 26.6,
    relativeHumidity: 70,
    pressure: 1007.3,
    recordedAt: "2026-08-12T19:56:00+08:00",
  },
  {
    id: "obs-0812-1900-a01",
    deviceId: "ANTV-A01",
    temperature: 25.2,
    relativeHumidity: 75,
    pressure: 1008.0,
    recordedAt: "2026-08-12T19:00:00+08:00",
  },
  {
    id: "obs-0812-1800-a01",
    deviceId: "ANTV-A01",
    temperature: 27.0,
    relativeHumidity: 69,
    pressure: 1006.7,
    recordedAt: "2026-08-12T18:00:00+08:00",
  },
];

class MockEnvironmentRepository implements EnvironmentRepository {
  async getSnapshot(): Promise<EnvironmentSnapshot> {
    const observations = [...mockObservations].sort(
      (left, right) =>
        new Date(right.recordedAt).getTime() -
        new Date(left.recordedAt).getTime(),
    );
    const latest = observations[0] ?? null;
    const previousForLatestDevice = latest
      ? observations.find(
          (observation) =>
            observation.deviceId === latest.deviceId &&
            observation.id !== latest.id,
        ) ?? null
      : null;

    return {
      observations,
      latest,
      temperatureDelta:
        latest && previousForLatestDevice
          ? Number(
              (latest.temperature - previousForLatestDevice.temperature).toFixed(
                1,
              ),
            )
          : null,
      humidityDelta:
        latest && previousForLatestDevice
          ? latest.relativeHumidity - previousForLatestDevice.relativeHumidity
          : null,
      syncedAt: latest?.recordedAt ?? new Date().toISOString(),
      source: "mock-database",
    };
  }
}

const repository: EnvironmentRepository = new MockEnvironmentRepository();

export function getEnvironmentRepository(): EnvironmentRepository {
  // Replace this binding with a database-backed repository later. Both the
  // dashboard card and environment page already consume this same contract.
  return repository;
}

export async function getEnvironmentSnapshot() {
  return getEnvironmentRepository().getSnapshot();
}

