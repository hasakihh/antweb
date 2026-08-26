"use client";

import { Camera, CircleStop, Download, Play } from "lucide-react";
import {
  MonitoringDataSection,
  MonitoringEmptyTable,
} from "@/components/monitoring/monitoring-data-section";
import type { StreamStatus } from "@/components/monitoring/monitoring-types";
import styles from "./monitoring-workspace.module.css";

export function LiveMonitoringPanel({
  isStreaming,
  streamStatus,
  onStartStreaming,
  onStopStreaming,
}: {
  isStreaming: boolean;
  streamStatus: StreamStatus;
  onStartStreaming: () => void;
  onStopStreaming: () => void;
}) {

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
              onClick={onStartStreaming}
              active={isStreaming}
            />
            <StreamControl
              icon={CircleStop}
              label="关闭推流"
              onClick={onStopStreaming}
              active={!isStreaming}
            />
            <StreamControl icon={Camera} label="截取当前帧" disabled={!isStreaming} />
            <StreamControl icon={Download} label="下载图片" disabled={!isStreaming} />
          </div>
          <span className={styles.pendingLabel}>
            {isStreaming ? "CONNECTING" : "STANDBY"}
          </span>
        </div>
      </div>

      <MonitoringDataSection kicker="LIVE DETECTION LOG" title="实时识别记录">
        <MonitoringEmptyTable
          minWidth={820}
          columns={["序号", "截图", "数量", "校正数量", "采集时间", "审核状态", "操作"]}
          emptyText="尚未有记录"
        />
      </MonitoringDataSection>
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
