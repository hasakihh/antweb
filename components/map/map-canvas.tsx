"use client";

import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Rectangle,
  TileLayer,
  useMap,
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

function MapSizeSync() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });

    observer.observe(container);
    map.invalidateSize({ animate: false });

    return () => observer.disconnect();
  }, [map]);

  return null;
}

function MapPaneSetup() {
  const map = useMap();

  useEffect(() => {
    const panes = [
      [MAP_PANES.satellite, MAP_PANE_Z_INDEX.satellite],
      [MAP_PANES.labels, MAP_PANE_Z_INDEX.labels],
      [MAP_PANES.heatmap, MAP_PANE_Z_INDEX.heatmap],
      [MAP_PANES.riskGrid, MAP_PANE_Z_INDEX.riskGrid],
      [MAP_PANES.riskPoint, MAP_PANE_Z_INDEX.riskPoint],
      [MAP_PANES.device, MAP_PANE_Z_INDEX.device],
    ] as const;

    panes.forEach(([name, zIndex]) => {
      const pane = map.getPane(name) ?? map.createPane(name);
      pane.style.zIndex = String(zIndex);
    });
  }, [map]);

  return null;
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
      <MapSizeSync />
      <MapPaneSetup />
      <TileLayer
        key={baseTileUrl}
        pane={MAP_PANES.satellite}
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

      <TileLayer
        pane={MAP_PANES.labels}
        url={TILE_LAYERS.labels.url}
        subdomains={[...TILE_LAYERS.labels.subdomains]}
        attribution={TILE_LAYERS.labels.attribution}
        opacity={0.9}
      />

      {showHeatmap ? (
        snapshot.occurrences.map((occurrence) => (
          <CircleMarker
            pane={MAP_PANES.heatmap}
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
        ))
      ) : null}

      {showRiskGrid ? (
        snapshot.grids.map((grid) => (
          <Rectangle
            pane={MAP_PANES.riskGrid}
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
        ))
      ) : null}

      {snapshot.occurrences.map((occurrence) => (
        <CircleMarker
          pane={MAP_PANES.riskPoint}
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

      {validDevices.map((device) => (
        <CircleMarker
          pane={MAP_PANES.device}
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
    </MapContainer>
  );
}
