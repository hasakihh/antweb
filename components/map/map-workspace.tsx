"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Layers3,
  List,
  MapPinned,
  Pencil,
  RefreshCw,
  ShieldAlert,
  Thermometer,
} from "lucide-react";
import type { MapSnapshot } from "@/lib/map/types";
import {
  formatMapTime,
  isValidCoordinate,
  validateCoordinateInput,
} from "@/lib/map/map-utils";
import styles from "./map-workspace.module.css";

const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>地图图层加载中…</div>,
});

interface MapWorkspaceProps {
  initialSnapshot: MapSnapshot;
}

export function MapWorkspace({ initialSnapshot }: MapWorkspaceProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRiskGrid, setShowRiskGrid] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [draftLatitude, setDraftLatitude] = useState("");
  const [draftLongitude, setDraftLongitude] = useState("");
  const [coordinateErrors, setCoordinateErrors] = useState<{
    latitude?: string;
    longitude?: string;
  }>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedRiskGridId, setSelectedRiskGridId] = useState<string | null>(null);
  const [highlightedRiskGridId, setHighlightedRiskGridId] = useState<string | null>(null);
  const riskFocusTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (riskFocusTimerRef.current !== null) {
        window.clearTimeout(riskFocusTimerRef.current);
      }
    },
    [],
  );

  function selectDevice(deviceId: string) {
    const device = snapshot.devices.find((item) => item.id === deviceId);
    if (!device || !isValidCoordinate(device.coordinate)) {
      setSelectedDeviceId(null);
      setStatusMessage("该设备暂无有效坐标，暂时无法定位");
      return;
    }

    setStatusMessage(null);
    setRightOpen(true);
    setSelectedDeviceId(deviceId);
  }

  function startEditing(event: MouseEvent<HTMLButtonElement>, deviceId: string) {
    event.stopPropagation();
    const device = snapshot.devices.find((item) => item.id === deviceId);
    if (!device) return;

    setRightOpen(true);
    setEditingDeviceId(deviceId);
    setCoordinateErrors({});
    setStatusMessage(null);
    setDraftLatitude(device.coordinate ? String(device.coordinate.latitude) : "");
    setDraftLongitude(device.coordinate ? String(device.coordinate.longitude) : "");
  }

  function saveCoordinate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingDeviceId) return;

    const result = validateCoordinateInput(draftLatitude, draftLongitude);
    setCoordinateErrors(result.errors);
    if (!result.isValid) return;

    setSnapshot((current) => ({
      ...current,
      devices: current.devices.map((device) =>
        device.id === editingDeviceId
          ? {
              ...device,
              coordinate: {
                latitude: result.latitude,
                longitude: result.longitude,
                source: "manual" as const,
                locatedAt: new Date().toISOString(),
              },
            }
          : device,
      ),
    }));
    setSelectedDeviceId(editingDeviceId);
    setEditingDeviceId(null);
    setCoordinateErrors({});
    setStatusMessage("坐标已更新，来源已切换为手动");
  }

  function focusRiskGrid(gridId: string) {
    if (riskFocusTimerRef.current !== null) {
      window.clearTimeout(riskFocusTimerRef.current);
    }

    setShowRiskGrid(true);
    setSelectedRiskGridId(gridId);
    setHighlightedRiskGridId(gridId);
    riskFocusTimerRef.current = window.setTimeout(() => {
      setHighlightedRiskGridId(null);
      riskFocusTimerRef.current = null;
    }, 3500);
  }

  return (
    <section className={styles.workspace} aria-label="地图监测工作区">
      <MapCanvas
        snapshot={snapshot}
        showHeatmap={showHeatmap}
        showRiskGrid={showRiskGrid}
        selectedDeviceId={selectedDeviceId}
        onDeviceSelect={selectDevice}
        selectedRiskGridId={selectedRiskGridId}
        highlightedRiskGridId={highlightedRiskGridId}
        onRiskGridSelect={focusRiskGrid}
      />

      <header className={styles.controlBar}>
        <div className={styles.brandBlock}>
          <span className={styles.brandIcon} aria-hidden="true">
            <MapPinned size={17} strokeWidth={1.8} />
          </span>
          <div>
            <strong>监测点位置分布</strong>
            <span>设备位置、发生点与风险网格</span>
          </div>
        </div>

        <div className={styles.summaryStrip} aria-label="地图摘要">
          <span><b>{snapshot.devices.length}</b> 总计</span>
          <span className={styles.online}><b>{snapshot.devices.filter((device) => device.status === "online").length}</b> 在线</span>
          <span className={styles.offline}><b>{snapshot.devices.filter((device) => device.status === "offline").length}</b> 离线</span>
          <span>更新于 {formatMapTime(snapshot.updatedAt)}</span>
        </div>

        <div className={styles.layerControls} aria-label="地图图层控制">
          <div className={styles.riskLegend} aria-label="风险等级图例">
            <span><i data-level="low" />低</span>
            <span><i data-level="medium" />中</span>
            <span><i data-level="high" />高</span>
            <span><i data-level="review" />复查</span>
          </div>
          <button
            type="button"
            className={showHeatmap ? styles.toggleActive : ""}
            aria-pressed={showHeatmap}
            onClick={() => setShowHeatmap((value) => !value)}
          >
            <Thermometer size={14} strokeWidth={1.8} />
            热力图
          </button>
          <button
            type="button"
            className={showRiskGrid ? styles.toggleActive : ""}
            aria-pressed={showRiskGrid}
            onClick={() => setShowRiskGrid((value) => !value)}
          >
            <Layers3 size={14} strokeWidth={1.8} />
            风险栅格
          </button>
          <button type="button" className={styles.iconButton} aria-label="刷新地图数据">
            <RefreshCw size={16} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <aside className={`${styles.drawer} ${styles.leftDrawer} ${leftOpen ? styles.drawerOpen : ""}`}>
        <button
          type="button"
          className={styles.drawerTab}
          aria-expanded={leftOpen}
          aria-controls="risk-overview-panel"
          onClick={() => setLeftOpen((value) => !value)}
        >
          {leftOpen ? <ChevronLeft size={16} /> : <ShieldAlert size={16} />}
          <span>{leftOpen ? "收起" : "风险概览"}</span>
        </button>
        <div className={styles.drawerPanel} id="risk-overview-panel">
          <div className={styles.drawerHeading}>
            <div>
              <span>RISK OVERVIEW</span>
              <h2>风险概览</h2>
            </div>
            <ShieldAlert size={18} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <div className={styles.metricGrid}>
            <div><strong>{snapshot.overview.detectionTotal}</strong><span>检测总数</span></div>
            <div><strong>{snapshot.overview.positiveTotal}</strong><span>阳性点数</span></div>
            <div data-tone="high"><strong>{snapshot.overview.highRiskAreaCount}</strong><span>高风险区域</span></div>
            <div data-tone="pending"><strong>{snapshot.overview.missingLocationCount}</strong><span>待补位置</span></div>
          </div>
          <div className={styles.alertHeader}>
            <AlertTriangle size={15} strokeWidth={1.8} />
            <strong>重点复查和预警</strong>
          </div>
          <div className={styles.alertList}>
            {snapshot.alerts.map((alert) => (
              <button className={styles.alertCard} type="button" onClick={() => focusRiskGrid(alert.gridId)} key={alert.id}>
                <strong>{alert.title}</strong>
                <span>风险分数 {alert.riskScore.toFixed(2)} · 阳性 {alert.positiveCount} 次</span>
                <small>栅格：{alert.gridId}　·　点击定位排查</small>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <aside className={`${styles.drawer} ${styles.rightDrawer} ${rightOpen ? styles.drawerOpen : ""}`}>
        <button
          type="button"
          className={styles.drawerTab}
          aria-expanded={rightOpen}
          aria-controls="device-list-panel"
          onClick={() => setRightOpen((value) => !value)}
        >
          {rightOpen ? <ChevronRight size={16} /> : <List size={16} />}
          <span>{rightOpen ? "收起" : "设备位置列表"}</span>
        </button>
        <div className={styles.drawerPanel} id="device-list-panel">
          <div className={styles.drawerHeading}>
            <div>
              <span>DEVICE LOCATIONS</span>
              <h2>设备位置列表</h2>
            </div>
            <List size={18} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <div className={styles.deviceList}>
            {snapshot.devices.map((device) => (
              <div className={styles.deviceItem} key={device.id}>
                <article className={`${styles.deviceRow} ${device.id === selectedDeviceId ? styles.deviceSelected : ""}`}>
                  <button
                    type="button"
                    className={styles.deviceSelectButton}
                    onClick={() => selectDevice(device.id)}
                    aria-label={`定位到${device.name}`}
                  >
                    <span className={`${styles.statusDot} ${device.status === "online" ? styles.statusOnline : styles.statusOffline}`} />
                    <span className={styles.deviceCopy}>
                      <strong>{device.name}</strong>
                      <span>ID：{device.id}</span>
                    </span>
                    <em>{device.coordinate?.source === "gps" ? "GPS" : device.coordinate ? "手动" : "待补"}</em>
                  </button>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={(event) => startEditing(event, device.id)}
                    aria-label={`编辑${device.name}经纬度`}
                  >
                    <Pencil size={14} strokeWidth={1.8} />
                  </button>
                </article>
                {editingDeviceId === device.id ? (
                  <form className={styles.coordinateForm} onSubmit={saveCoordinate}>
                    <label>
                      <span>纬度</span>
                      <input
                        inputMode="decimal"
                        value={draftLatitude}
                        onChange={(event) => setDraftLatitude(event.target.value)}
                        aria-invalid={Boolean(coordinateErrors.latitude)}
                      />
                      {coordinateErrors.latitude ? <small>{coordinateErrors.latitude}</small> : null}
                    </label>
                    <label>
                      <span>经度</span>
                      <input
                        inputMode="decimal"
                        value={draftLongitude}
                        onChange={(event) => setDraftLongitude(event.target.value)}
                        aria-invalid={Boolean(coordinateErrors.longitude)}
                      />
                      {coordinateErrors.longitude ? <small>{coordinateErrors.longitude}</small> : null}
                    </label>
                    <div className={styles.formActions}>
                      <button type="submit">保存坐标</button>
                      <button type="button" onClick={() => setEditingDeviceId(null)}>取消</button>
                    </div>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
          {statusMessage ? <p className={styles.panelStatus} role="status">{statusMessage}</p> : null}
          <p className={styles.panelHint}>点击设备定位；铅笔按钮可编辑经纬度</p>
        </div>
      </aside>

      <div className={styles.mapBadge}>
        <span><span className={styles.liveDot} /> MOCK DATA</span>
        <span>{showHeatmap ? "热力图开" : "热力图关"} · {showRiskGrid ? "栅格开" : "栅格关"}</span>
      </div>
    </section>
  );
}
