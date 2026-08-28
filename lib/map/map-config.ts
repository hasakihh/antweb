export const MAP_PANES = {
  satellite: "map-satellite",
  labels: "map-labels",
  heatmap: "map-heatmap",
  riskGrid: "map-risk-grid",
  riskPoint: "map-risk-point",
  device: "map-device",
} as const;

export const MAP_PANE_Z_INDEX = {
  satellite: 200,
  labels: 250,
  heatmap: 300,
  riskGrid: 400,
  riskPoint: 500,
  device: 600,
} as const;

// The public Gaode satellite tiles reliably cover zoom levels 5–18.
export const MAP_MAX_ZOOM = 18;

export const TILE_LAYERS = {
  satellite: {
    label: "高德卫星",
    url: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    subdomains: ["1", "2", "3", "4"],
    attribution: "&copy; 高德地图",
  },
  labels: {
    label: "高德标签",
    url: "https://webrd0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
    subdomains: ["1", "2", "3", "4"],
    attribution: "&copy; 高德地图",
  },
  fallback: {
    label: "OpenStreetMap 回退",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: ["a", "b", "c"],
    attribution: "&copy; OpenStreetMap contributors",
  },
} as const;

export const RISK_COLORS = {
  low: "#55b68b",
  medium: "#e2b84f",
  high: "#ef5b5b",
  review: "#a779d4",
} as const;
