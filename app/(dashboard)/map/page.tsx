import { MapWorkspace } from "@/components/map/map-workspace";
import { getMapSnapshot } from "@/lib/map/map-repository";

export default async function MapPage() {
  const snapshot = await getMapSnapshot();

  return <MapWorkspace initialSnapshot={snapshot} />;
}
