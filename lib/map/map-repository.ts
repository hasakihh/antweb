import { mockMapSnapshot } from "@/lib/map/mock-map-data";
import type { MapSnapshot } from "@/lib/map/types";

export interface MapRepository {
  getSnapshot(): Promise<MapSnapshot>;
}

class MockMapRepository implements MapRepository {
  async getSnapshot() {
    return mockMapSnapshot;
  }
}

const repository: MapRepository = new MockMapRepository();

export function getMapRepository() {
  return repository;
}

export async function getMapSnapshot() {
  return getMapRepository().getSnapshot();
}
