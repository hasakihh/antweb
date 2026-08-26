"use client";

import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import {
  ScanSearch,
  Video,
} from "lucide-react";
import { LiveMonitoringPanel } from "@/components/monitoring/live-monitoring-panel";
import { LocalDetectionPanel } from "@/components/monitoring/local-detection-panel";
import type { MonitoringMode } from "@/components/monitoring/monitoring-types";
import { useResponsiveCanvas } from "@/components/layout/use-responsive-canvas";
import styles from "./monitoring-workspace.module.css";

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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { canvasHeight, canvasRef, canvasScale, canvasViewportRef } =
    useResponsiveCanvas(MOBILE_CANVAS_WIDTH, mode);

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
