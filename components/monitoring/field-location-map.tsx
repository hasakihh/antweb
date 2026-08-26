"use client";

import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { LocateFixed, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import styles from "./field-location-map.module.css";

export interface FieldLocation {
  latitude: number;
  longitude: number;
}

interface FieldLocationMapProps {
  value: FieldLocation | null;
  onChange: (location: FieldLocation) => void;
}

const DEFAULT_CENTER: [number, number] = [23.1291, 113.2644];

function MapEvents({ onChange }: Pick<FieldLocationMapProps, "onChange">) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapPosition({ value }: Pick<FieldLocationMapProps, "value">) {
  const map = useMap();

  useEffect(() => {
    if (value) {
      map.flyTo([value.latitude, value.longitude], Math.max(map.getZoom(), 15), {
        duration: 0.7,
      });
    }
  }, [map, value]);

  if (!value) return null;

  return (
    <CircleMarker
      center={[value.latitude, value.longitude]}
      radius={7}
      pathOptions={{
        color: "#f4f1e9",
        fillColor: "#171717",
        fillOpacity: 1,
        opacity: 0.95,
        weight: 3,
      }}
    />
  );
}

export function FieldLocationMap({ value, onChange }: FieldLocationMapProps) {
  const [locationState, setLocationState] = useState<"idle" | "locating" | "error">(
    "idle",
  );

  function locateDevice() {
    if (!navigator.geolocation) {
      setLocationState("error");
      return;
    }

    setLocationState("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationState("idle");
      },
      () => setLocationState("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className={styles.mapFrame}>
      <MapContainer
        className={styles.mapRoot}
        center={DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom
        zoomControl={false}
        aria-label="发现位置地图选点"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onChange={onChange} />
        <MapPosition value={value} />
      </MapContainer>

      <div className={styles.mapInstruction}>
        <MapPin size={13} strokeWidth={1.8} aria-hidden="true" />
        点击地图选择发现位置
      </div>

      <button
        className={styles.locateButton}
        type="button"
        onClick={locateDevice}
        disabled={locationState === "locating"}
        aria-label="定位到当前设备位置"
      >
        <LocateFixed size={15} strokeWidth={1.8} aria-hidden="true" />
        {locationState === "locating"
          ? "定位中"
          : locationState === "error"
            ? "重试定位"
            : "当前位置"}
      </button>
    </div>
  );
}
