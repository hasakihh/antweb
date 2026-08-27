"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  Rectangle,
  TileLayer,
  useMap,
} from "react-leaflet";
import { divIcon } from "leaflet";
import type { Marker as LeafletMarker, Rectangle as LeafletRectangle } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_PANES, MAP_PANE_Z_INDEX, TILE_LAYERS } from "@/lib/map/map-config";
import { clampRiskRadius, formatCoordinate, formatMapTime, isValidCoordinate, riskColor } from "@/lib/map/map-utils";
import type { DeviceLocation, MapSnapshot, RiskGrid, RiskOccurrence } from "@/lib/map/types";
import { DeviceTrendChart } from "@/components/map/device-trend-chart";
import styles from "./map-workspace.module.css";

interface MapCanvasProps {
  snapshot: MapSnapshot;
  showHeatmap: boolean;
  showRiskGrid: boolean;
  selectedDeviceId: string | null;
  onDeviceSelect: (deviceId: string) => void;
  selectedRiskGridId: string | null;
  highlightedRiskGridId: string | null;
  onRiskGridSelect: (gridId: string) => void;
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

function deviceMarkerIcon(device: DeviceLocation, isSelected: boolean) {
  const markerColor = device.status === "online" ? "#2e9bff" : "#e25352";
  return divIcon({
    className: styles.markerIconShell,
    iconSize: [34, 40],
    iconAnchor: [17, 38],
    popupAnchor: [0, -35],
    html: `
      <span class="${styles.deviceMarkerIcon} ${isSelected ? styles.markerSelected : ""}" style="--marker-color:${markerColor}">
        <svg viewBox="0 0 28 36" aria-hidden="true" focusable="false">
          <path d="M14 1.5C7.65 1.5 2.5 6.58 2.5 12.85c0 7.44 11.5 20.18 11.5 20.18s11.5-12.74 11.5-20.18C25.5 6.58 20.35 1.5 14 1.5Z" />
          <rect x="8" y="8" width="12" height="9" rx="2" />
          <path d="M11 20.5h6M14 17v3.5" />
          <circle cx="14" cy="12.5" r="1.8" />
        </svg>
      </span>
    `,
  });
}

function occurrenceMarkerIcon(occurrence: RiskOccurrence) {
  const color = riskColor(occurrence.riskLevel);
  const radius = clampRiskRadius(occurrence.detectionCount);
  const size = Math.round(radius * 2 + 8);
  return divIcon({
    className: styles.markerIconShell,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
    html: `
      <span class="${styles.occurrenceMarkerIcon}" style="--marker-color:${color};--marker-size:${size}px">
        <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
          <path d="M14 1.5 26.5 14 14 26.5 1.5 14 14 1.5Z" />
          <path d="M14 8v7" />
          <circle cx="14" cy="19.5" r="1.2" />
        </svg>
      </span>
    `,
  });
}

function DeviceMarker({
  device,
  isSelected,
  onSelect,
}: {
  device: DeviceLocation;
  isSelected: boolean;
  onSelect: (deviceId: string) => void;
}) {
  const map = useMap();
  const markerRef = useRef<LeafletMarker | null>(null);
  const coordinate = device.coordinate;

  useEffect(() => {
    if (!isSelected || !coordinate || !isValidCoordinate(coordinate)) return;

    map.flyTo([coordinate.latitude, coordinate.longitude], 16, {
      duration: 0.75,
    });
    const popupTimer = window.setTimeout(() => markerRef.current?.openPopup(), 120);
    return () => window.clearTimeout(popupTimer);
  }, [coordinate, isSelected, map]);

  if (!coordinate || !isValidCoordinate(coordinate)) return null;

  return (
    <Marker
      ref={markerRef}
      pane={MAP_PANES.device}
      position={[coordinate.latitude, coordinate.longitude]}
      icon={deviceMarkerIcon(device, isSelected)}
      eventHandlers={{ click: () => onSelect(device.id) }}
    >
      <Popup className={styles.devicePopup} closeButton>
        <div className={styles.popupContent}>
          <div className={styles.popupHeading}>
            <div>
              <span>DEVICE DETAIL</span>
              <strong>{device.name}</strong>
            </div>
            <i className={device.status === "online" ? styles.popupOnline : styles.popupOffline} />
          </div>
          <dl className={styles.popupMeta}>
            <div><dt>设备 ID</dt><dd>{device.id}</dd></div>
            <div><dt>地图坐标</dt><dd>{formatCoordinate(coordinate.latitude)}, {formatCoordinate(coordinate.longitude)}</dd></div>
            <div><dt>坐标来源</dt><dd>{coordinate.source === "gps" ? "GPS" : "手动"}</dd></div>
            <div><dt>定位时间</dt><dd>{formatMapTime(coordinate.locatedAt)}</dd></div>
          </dl>
          <div className={styles.popupTrend}>
            <span>数量趋势</span>
            <DeviceTrendChart points={device.trend} />
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function RiskOccurrenceMarker({ occurrence }: { occurrence: RiskOccurrence }) {
  return (
    <Marker
      pane={MAP_PANES.riskPoint}
      position={[occurrence.coordinate.latitude, occurrence.coordinate.longitude]}
      icon={occurrenceMarkerIcon(occurrence)}
    >
      <Popup>
        <div className={styles.popupContent}>
          <div className={styles.popupHeading}>
            <div>
              <span>RISK OCCURRENCE</span>
              <strong>风险发生点</strong>
            </div>
            <i className={styles.riskPopupDot} style={{ background: riskColor(occurrence.riskLevel) }} />
          </div>
          <dl className={styles.popupMeta}>
            <div><dt>来源</dt><dd>{occurrence.source}</dd></div>
            <div><dt>检测数量</dt><dd>{occurrence.detectionCount} 次</dd></div>
            <div><dt>风险等级</dt><dd>{occurrence.riskLevel}</dd></div>
            <div><dt>检测时间</dt><dd>{formatMapTime(occurrence.detectedAt)}</dd></div>
          </dl>
        </div>
      </Popup>
    </Marker>
  );
}

function RiskGridShape({
  grid,
  isSelected,
  isHighlighted,
  onSelect,
}: {
  grid: RiskGrid;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (gridId: string) => void;
}) {
  const map = useMap();
  const rectangleRef = useRef<LeafletRectangle | null>(null);

  useEffect(() => {
    if (!isSelected) return;

    map.flyTo([grid.center.latitude, grid.center.longitude], Math.max(map.getZoom(), 15), {
      duration: 0.8,
    });
    const popupTimer = window.setTimeout(() => rectangleRef.current?.openPopup(), 140);
    return () => window.clearTimeout(popupTimer);
  }, [grid.center.latitude, grid.center.longitude, isSelected, map]);

  return (
    <Rectangle
      ref={rectangleRef}
      pane={MAP_PANES.riskGrid}
      bounds={[
        [grid.bounds.south, grid.bounds.west],
        [grid.bounds.north, grid.bounds.east],
      ]}
      pathOptions={{
        color: riskColor(grid.riskLevel),
        fillColor: riskColor(grid.riskLevel),
        fillOpacity: isHighlighted ? 0.26 : grid.needsAlert ? 0.12 : 0.06,
        weight: isHighlighted ? 4 : grid.needsAlert ? 1.5 : 1,
        dashArray: isHighlighted ? undefined : grid.needsAlert ? "5 4" : undefined,
      }}
      eventHandlers={{ click: () => onSelect(grid.id) }}
    >
      <Popup>
        <div className={styles.popupContent}>
          <div className={styles.popupHeading}>
            <div>
              <span>RISK GRID</span>
              <strong>栅格 {grid.id}</strong>
            </div>
            <i className={styles.riskPopupDot} style={{ background: riskColor(grid.riskLevel) }} />
          </div>
          <dl className={styles.popupMeta}>
            <div><dt>检测次数</dt><dd>{grid.detectionCount} 次</dd></div>
            <div><dt>阳性次数</dt><dd>{grid.positiveCount} 次</dd></div>
            <div><dt>风险分数</dt><dd>{grid.riskScore.toFixed(2)}</dd></div>
            <div><dt>风险趋势</dt><dd>{grid.trend === "rising" ? "上升" : grid.trend === "falling" ? "下降" : "稳定"}</dd></div>
            <div><dt>最近检测</dt><dd>{formatMapTime(grid.latestDetectedAt)}</dd></div>
          </dl>
        </div>
      </Popup>
    </Rectangle>
  );
}

export default function MapCanvas({
  snapshot,
  showHeatmap,
  showRiskGrid,
  selectedDeviceId,
  onDeviceSelect,
  selectedRiskGridId,
  highlightedRiskGridId,
  onRiskGridSelect,
}: MapCanvasProps) {
  const [baseTileUrl, setBaseTileUrl] = useState<string>(TILE_LAYERS.satellite.url);
  const [isFallback, setIsFallback] = useState(false);
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
              color: "#4aa3c7",
              fillColor: "#4aa3c7",
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
          <RiskGridShape
            grid={grid}
            isSelected={grid.id === selectedRiskGridId}
            isHighlighted={grid.id === highlightedRiskGridId}
            onSelect={onRiskGridSelect}
            key={grid.id}
          />
        ))
      ) : null}

      {snapshot.occurrences.map((occurrence) => (
        <RiskOccurrenceMarker occurrence={occurrence} key={occurrence.id} />
      ))}

      {snapshot.devices.map((device) => (
        <DeviceMarker
          device={device}
          isSelected={device.id === selectedDeviceId}
          onSelect={onDeviceSelect}
          key={device.id}
        />
      ))}
    </MapContainer>
  );
}
