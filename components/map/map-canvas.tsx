"use client";

import { useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Pane,
  Rectangle,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_PANES, MAP_PANE_Z_INDEX, TILE_LAYERS } from "@/lib/map/map-config";
import { clampRiskRadius, isValidCoordinate, riskColor } from "@/lib/map/map-utils";
import type { MapSnapshot } from "@/lib/map/types";
import styles from "./map-workspace.module.css";

interface MapCanvasProps {
  snapshot: MapSnapshot;
  showHeatmap: boolean;
  showRiskGrid: boolean;
}

export default function MapCanvas({
  snapshot,
  showHeatmap,
  showRiskGrid,
}: MapCanvasProps) {
  const [baseTileUrl, setBaseTileUrl] = useState<string>(TILE_LAYERS.satellite.url);
  const [isFallback, setIsFallback] = useState(false);
  const validDevices = snapshot.devices.filter((device) =>
    isValidCoordinate(device.coordinate),
  );

  return (
    <MapContainer
      className={styles.mapRoot}
      center={[snapshot.center.latitude, snapshot.center.longitude]}
      zoom={12}
      minZoom={5}
      maxZoom={19}
      scrollWheelZoom
      zoomControl
      attributionControl
      aria-label="监测地图"
    >
      <Pane name={MAP_PANES.satellite} style={{ zIndex: MAP_PANE_Z_INDEX.satellite }}>
        <TileLayer
          key={baseTileUrl}
          url={baseTileUrl}
          subdomains={
            isFallback
              ? [...TILE_LAYERS.fallback.subdomains]
              : [...TILE_LAYERS.satellite.subdomains]
          }
          attribution={
            isFallback ? TILE_LAYERS.fallback.attribution : TILE_LAYERS.satellite.attribution
          }
          eventHandlers={{
            tileerror: () => {
              if (!isFallback) {
                setIsFallback(true);
                setBaseTileUrl(TILE_LAYERS.fallback.url);
              }
            },
          }}
        />
      </Pane>

      <Pane name={MAP_PANES.labels} style={{ zIndex: MAP_PANE_Z_INDEX.labels }}>
        <TileLayer
          url={TILE_LAYERS.labels.url}
          subdomains={[...TILE_LAYERS.labels.subdomains]}
          attribution={TILE_LAYERS.labels.attribution}
          opacity={0.9}
        />
      </Pane>

      {showHeatmap ? (
        <Pane name={MAP_PANES.heatmap} style={{ zIndex: MAP_PANE_Z_INDEX.heatmap }}>
          {snapshot.occurrences.map((occurrence) => (
            <CircleMarker
              center={[occurrence.coordinate.latitude, occurrence.coordinate.longitude]}
              radius={Math.min(40, 18 + occurrence.detectionCount)}
              pathOptions={{
                color: "#f29f4b",
                fillColor: "#f29f4b",
                fillOpacity: 0.08,
                opacity: 0.04,
                weight: 10,
              }}
              key={`heat-${occurrence.id}`}
            />
          ))}
        </Pane>
      ) : null}

      {showRiskGrid ? (
        <Pane name={MAP_PANES.riskGrid} style={{ zIndex: MAP_PANE_Z_INDEX.riskGrid }}>
          {snapshot.grids.map((grid) => (
            <Rectangle
              bounds={[
                [grid.bounds.south, grid.bounds.west],
                [grid.bounds.north, grid.bounds.east],
              ]}
              pathOptions={{
                color: riskColor(grid.riskLevel),
                fillColor: riskColor(grid.riskLevel),
                fillOpacity: grid.needsAlert ? 0.12 : 0.06,
                weight: grid.needsAlert ? 1.5 : 1,
                dashArray: grid.needsAlert ? "5 4" : undefined,
              }}
              key={grid.id}
            />
          ))}
        </Pane>
      ) : null}

      <Pane name={MAP_PANES.riskPoint} style={{ zIndex: MAP_PANE_Z_INDEX.riskPoint }}>
        {snapshot.occurrences.map((occurrence) => (
          <CircleMarker
            center={[occurrence.coordinate.latitude, occurrence.coordinate.longitude]}
            radius={clampRiskRadius(occurrence.detectionCount)}
            pathOptions={{
              color: "rgba(8, 8, 8, 0.85)",
              fillColor: riskColor(occurrence.riskLevel),
              fillOpacity: 0.92,
              weight: 2,
            }}
            key={occurrence.id}
          />
        ))}
      </Pane>

      <Pane name={MAP_PANES.device} style={{ zIndex: MAP_PANE_Z_INDEX.device }}>
        {validDevices.map((device) => (
          <CircleMarker
            center={[device.coordinate!.latitude, device.coordinate!.longitude]}
            radius={7}
            pathOptions={{
              color: "#f6f2e9",
              fillColor: device.status === "online" ? "#2e9bff" : "#767d8a",
              fillOpacity: 1,
              weight: 3,
            }}
            key={device.id}
          />
        ))}
      </Pane>
    </MapContainer>
  );
}
