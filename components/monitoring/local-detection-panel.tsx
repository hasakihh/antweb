"use client";

import dynamic from "next/dynamic";
import { ImagePlus, ScanSearch, Upload } from "lucide-react";
import {
  MonitoringDataSection,
  MonitoringEmptyTable,
} from "@/components/monitoring/monitoring-data-section";
import type { FieldLocation } from "@/components/monitoring/monitoring-types";
import styles from "./monitoring-workspace.module.css";

const FieldLocationMap = dynamic(
  () =>
    import("@/components/monitoring/field-location-map").then(
      (module) => module.FieldLocationMap,
    ),
  {
    ssr: false,
    loading: () => <div className={styles.mapLoading}>地图载入中</div>,
  },
);

export function LocalDetectionPanel({
  fieldLocation,
  onFieldLocationChange,
}: {
  fieldLocation: FieldLocation | null;
  onFieldLocationChange: (location: FieldLocation) => void;
}) {

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
            <button type="button" disabled title="等待后端识别接口接入">
              <Upload size={15} strokeWidth={1.7} aria-hidden="true" />
              选择图片
            </button>
          </div>

          <div className={styles.uploadFooter}>
            <div>
              <span>文件预览</span>
              <strong>尚未选择图像</strong>
            </div>
            <button type="button" disabled title="等待后端识别接口接入">
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

          <FieldLocationMap value={fieldLocation} onChange={onFieldLocationChange} />

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
                {fieldLocation
                  ? "坐标将用于匹配现场天气数据"
                  : "可点击地图或使用当前位置"}
              </small>
            </div>
          </div>
        </section>
      </div>

      <MonitoringDataSection kicker="MODEL REVIEW QUEUE" title="待审核">
        <MonitoringEmptyTable
          minWidth={980}
          columns={["图片", "模型物种", "模型数量", "置信度", "人工校正物种", "人工校正数量", "审核状态", "操作"]}
          emptyText="上传图像并完成模型识别后，待审核结果将显示在这里"
        />
      </MonitoringDataSection>

      <MonitoringDataSection kicker="VERIFIED DATABASE" title="检测记录">
        <MonitoringEmptyTable
          minWidth={1120}
          columns={["序号", "图片", "物种", "数量", "经纬度", "温度", "相对湿度", "气压", "记录时间"]}
          emptyText="尚无已审核并归档的本地检测记录"
        />
      </MonitoringDataSection>
    </section>
  );
}
