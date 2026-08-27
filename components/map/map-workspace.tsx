"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Layers3,
  List,
  MapPinned,
  RefreshCw,
  ShieldAlert,
  Thermometer,
} from "lucide-react";
import type { MapSnapshot } from "@/lib/map/types";
import { formatMapTime } from "@/lib/map/map-utils";
import styles from "./map-workspace.module.css";

const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>地图图层加载中…</div>,
});

interface MapWorkspaceProps {
  initialSnapshot: MapSnapshot;
}

export function MapWorkspace({ initialSnapshot }: MapWorkspaceProps) {
  const [snapshot] = useState(initialSnapshot);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRiskGrid, setShowRiskGrid] = useState(true);

  return (
    <section className={styles.workspace} aria-label="地图监测工作区">
      <MapCanvas
        snapshot={snapshot}
        showHeatmap={showHeatmap}
        showRiskGrid={showRiskGrid}
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
              <article className={styles.alertCard} key={alert.id}>
                <strong>{alert.title}</strong>
                <span>风险分数 {alert.riskScore.toFixed(2)} · 阳性 {alert.positiveCount} 次</span>
                <small>栅格：{alert.gridId}　·　点击定位排查</small>
              </article>
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
              <article className={styles.deviceRow} key={device.id}>
                <span className={`${styles.statusDot} ${device.status === "online" ? styles.statusOnline : styles.statusOffline}`} />
                <div>
                  <strong>{device.name}</strong>
                  <span>ID：{device.id}</span>
                </div>
                <em>{device.coordinate?.source === "gps" ? "GPS" : device.coordinate ? "手动" : "待补"}</em>
              </article>
            ))}
          </div>
          <p className={styles.panelHint}>设备定位与坐标编辑将在下一阶段启用</p>
        </div>
      </aside>

      <div className={styles.mapBadge}>
        <span><span className={styles.liveDot} /> MOCK DATA</span>
        <span>{showHeatmap ? "热力图开" : "热力图关"} · {showRiskGrid ? "栅格开" : "栅格关"}</span>
      </div>
    </section>
  );
}
