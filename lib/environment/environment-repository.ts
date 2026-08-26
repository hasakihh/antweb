import type {
  EnvironmentSnapshot,
} from "@/lib/environment/types";
import { mockEnvironmentObservations } from "@/lib/environment/mock-environment-data";

export interface EnvironmentRepository {
  getSnapshot(): Promise<EnvironmentSnapshot>;
}

class MockEnvironmentRepository implements EnvironmentRepository {
  async getSnapshot(): Promise<EnvironmentSnapshot> {
    const observations = [...mockEnvironmentObservations].sort(
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
