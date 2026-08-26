"use client";

import type { CSSProperties } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Camera,
  CircleStop,
  Download,
  ImagePlus,
  Play,
  ScanSearch,
  Upload,
  Video,
} from "lucide-react";
import type { FieldLocation } from "./field-location-map";
import styles from "./monitoring-workspace.module.css";

const FieldLocationMap = dynamic(
  () => import("./field-location-map").then((module) => module.FieldLocationMap),
  {
    ssr: false,
    loading: () => <div className={styles.mapLoading}>地图载入中</div>,
  },
);

export type MonitoringMode = "live" | "local";
export type StreamStatus = "offline" | "connecting" | "online" | "error";

export interface LiveDetectionRecord {
  id: string;
  imageUrl: string;
  detectedCount: number;
  correctedCount: number | null;
  capturedAt: string;
  reviewStatus: "pending" | "reviewed";
}

export interface LocalDetectionDraft {
  id: string;
  imageUrl: string;
  modelSpecies: string;
  modelCount: number;
  confidence: number;
  correctedSpecies: string;
  correctedCount: number;
  reviewStatus: "pending" | "approved";
}

export interface ReviewedDetectionRecord {
  id: string;
  imageUrl: string;
  species: string;
  count: number;
  longitude: number;
  latitude: number;
  temperature: number;
  relativeHumidity: number;
  pressure: number;
  recordedAt: string;
}

const modes: ReadonlyArray<{
  id: MonitoringMode;
  label: string;
  englishLabel: string;
  icon: typeof Video;
}> = [
  { id: "live", label: "实时监控", englishLabel: "LIVE", icon: Video },
  { id: "local", label: "本地检测", englishLabel: "LOCAL", icon: ScanSearch },
];

type CanvasStyle = CSSProperties & {
  "--monitor-canvas-height": string;
  "--monitor-canvas-scale": number;
};

const MOBILE_CANVAS_WIDTH = 860;

export function MonitoringWorkspace() {
  const [mode, setMode] = useState<MonitoringMode>("live");
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const viewport = canvasViewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;

    const updateCanvas = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const nextScale = isMobile
        ? Math.min(1, viewport.clientWidth / MOBILE_CANVAS_WIDTH)
        : 1;

      setCanvasScale(nextScale);
      setCanvasHeight(isMobile ? canvas.scrollHeight * nextScale : 0);
    };

    const observer = new ResizeObserver(updateCanvas);
    observer.observe(viewport);
    observer.observe(canvas);
    const updateFrame = window.requestAnimationFrame(updateCanvas);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(updateFrame);
    };
  }, [mode]);

  function selectMode(nextMode: MonitoringMode) {
    setMode(nextMode);
  }

  function handleTabKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    let nextIndex = currentIndex;

    if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + modes.length) % modes.length;
    } else if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % modes.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = modes.length - 1;
    }

    selectMode(modes[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.modeBar}>
        <div className={styles.modeTabs} role="tablist" aria-label="监测工作模式">
          {modes.map((item, index) => {
            const Icon = item.icon;
            const isSelected = item.id === mode;

            return (
              <button
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`monitoring-tab-${item.id}`}
                aria-controls={`monitoring-panel-${item.id}`}
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={isSelected ? styles.activeMode : undefined}
                onClick={() => selectMode(item.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                key={item.id}
              >
                <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
                <span>{item.label}</span>
                <small>{item.englishLabel}</small>
              </button>
            );
          })}
        </div>


      </div>

      <div
        ref={canvasViewportRef}
        className={styles.canvasViewport}
        style={
          {
            "--monitor-canvas-height": `${canvasHeight}px`,
            "--monitor-canvas-scale": canvasScale,
          } as CanvasStyle
        }
      >
        <div ref={canvasRef} className={styles.canvas}>
          {mode === "live" ? <LiveMonitoringPanel /> : <LocalDetectionPanel />}
        </div>
      </div>
    </div>
  );
}

function LiveMonitoringPanel() {
  const streamStatus: StreamStatus = "offline";
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <section
      className={styles.modePanel}
      role="tabpanel"
      id="monitoring-panel-live"
      aria-labelledby="monitoring-tab-live"
    >
      <div className={styles.videoStage} tabIndex={0}>
        <div className={styles.videoPlaceholder} aria-label="实时监控视频画面占位">
          <span className={styles.scanLine} aria-hidden="true" />
          <div className={styles.frameCorners} aria-hidden="true" />
          <div className={styles.videoEmptyState}>
            <Camera size={26} strokeWidth={1.3} aria-hidden="true" />
            <strong>等待推流ing...</strong>
            <span>LIVE STREAM / NO SIGNAL</span>
          </div>
        </div>

        <div className={styles.deviceStatus} data-status={streamStatus}>
          <span className={styles.statusDot} aria-hidden="true" />
          <div>
            <strong>设备未连接</strong>
            <small>ANTV-CAM-01</small>
          </div>
          <time>最近连接 --:--</time>
        </div>

        <div className={styles.playerControls} aria-label="视频流控制">
          <div className={styles.controlStatus}>
            <span data-status={isStreaming ? "connecting" : streamStatus} />
            {isStreaming ? "等待设备响应" : "推流已关闭"}
          </div>
          <div className={styles.controlButtons}>
            <StreamControl
              icon={Play}
              label="开启推流"
              onClick={() => setIsStreaming(true)}
              active={isStreaming}
            />
            <StreamControl
              icon={CircleStop}
              label="关闭推流"
              onClick={() => setIsStreaming(false)}
              active={!isStreaming}
            />
            <StreamControl icon={Camera} label="截取当前帧" disabled={!isStreaming} />
            <StreamControl icon={Download} label="下载图片" disabled={!isStreaming} />
          </div>
          <span className={styles.pendingLabel}>{isStreaming ? "CONNECTING" : "STANDBY"}</span>
        </div>
      </div>

      <DataSection
        kicker="LIVE DETECTION LOG"
        title="实时识别记录"
        description=""
      >
        <EmptyTable
          minWidth={820}
          columns={[
            "序号",
            "截图",
            "数量",
            "校正数量",
            "采集时间",
            "审核状态",
            "操作",
          ]}
          emptyText="尚未有记录"
        />
      </DataSection>
    </section>
  );
}

function LocalDetectionPanel() {
  const [fieldLocation, setFieldLocation] = useState<FieldLocation | null>(null);

  const longitude = fieldLocation?.longitude.toFixed(6) ?? "--.------";
  const latitude = fieldLocation?.latitude.toFixed(6) ?? "--.------";

  return (
    <section
      className={styles.modePanel}
      role="tabpanel"
      id="monitoring-panel-local"
      aria-labelledby="monitoring-tab-local"
    >
      <div className={styles.localInputGrid}>
        <section className={styles.uploadRegion} aria-labelledby="upload-title">
          <div className={styles.sectionIntro}>
            <div>
              <p>IMAGE INPUT</p>
              <h2 id="upload-title">图像检测</h2>
            </div>
            <span>支持 JPG / PNG / WEBP</span>
          </div>

          <div className={styles.dropZone}>
            <span className={styles.uploadIcon} aria-hidden="true">
              <ImagePlus size={22} strokeWidth={1.45} />
            </span>
            <strong>上传图片</strong>
            <p>从本地文件中选择需要检测的图像</p>
            <button type="button" disabled>
              <Upload size={15} strokeWidth={1.7} aria-hidden="true" />
              选择图片
            </button>
          </div>

          <div className={styles.uploadFooter}>
            <div>
              <span>文件预览</span>
              <strong>尚未选择图像</strong>
            </div>
            <button type="button" disabled>
              <ScanSearch size={15} strokeWidth={1.7} aria-hidden="true" />
              开始识别
            </button>
          </div>
        </section>

        <section className={styles.coordinatePanel} aria-labelledby="coordinate-title">
          <div className={styles.sectionIntro}>
            <div>
              <p>GPS POSITION</p>
              <h2 id="coordinate-title">发现位置</h2>
            </div>
            <span>点击地图选择坐标</span>
          </div>

          <FieldLocationMap value={fieldLocation} onChange={setFieldLocation} />

          <div className={styles.coordinateReadout}>
            <label>
              <span>经度 LONGITUDE</span>
              <input value={longitude} readOnly aria-label="经度" />
            </label>
            <label>
              <span>纬度 LATITUDE</span>
              <input value={latitude} readOnly aria-label="纬度" />
            </label>
          </div>

          <div className={styles.locationState}>
            <span aria-hidden="true" />
            <div>
              <strong>{fieldLocation ? "位置已选定" : "尚未选择坐标"}</strong>
              <small>
                {fieldLocation ? "坐标将用于匹配现场天气数据" : "可点击地图或使用当前位置"}
              </small>
            </div>
          </div>
        </section>
      </div>

      <DataSection
        kicker="MODEL REVIEW QUEUE"
        title="待审核"
        description=""
      >
        <EmptyTable
          minWidth={980}
          columns={[
            "图片",
            "模型物种",
            "模型数量",
            "置信度",
            "人工校正物种",
            "人工校正数量",
            "审核状态",
            "操作",
          ]}
          emptyText="上传图像并完成模型识别后，待审核结果将显示在这里"
        />
      </DataSection>

      <DataSection
        kicker="VERIFIED DATABASE"
        title="检测记录"
        description=""
      >
        <EmptyTable
          minWidth={1120}
          columns={[
            "序号",
            "图片",
            "物种",
            "数量",
            "经纬度",
            "温度",
            "相对湿度",
            "气压",
            "记录时间",
          ]}
          emptyText="尚无已审核并归档的本地检测记录"
        />
      </DataSection>
    </section>
  );
}

function StreamControl({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: typeof Play;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      data-active={active || undefined}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      aria-label={disabled ? `${label}，请先开启推流` : label}
    >
      <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

function DataSection({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.dataSection}>
      <header className={styles.dataHeading}>
        <div>
          <p>{kicker}</p>
          <h2>{title}</h2>
        </div>
        <span>{description}</span>
      </header>
      {children}
    </section>
  );
}

function EmptyTable({
  columns,
  emptyText,
  minWidth,
}: {
  columns: string[];
  emptyText: string;
  minWidth: number;
}) {
  return (
    <div className={styles.tableFrame}>
      <div className={styles.tableScroller}>
        <table style={{ minWidth }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      <div className={styles.emptyRows}>
        <span aria-hidden="true" />
        <p>{emptyText}</p>
      </div>
    </div>
  );
}
