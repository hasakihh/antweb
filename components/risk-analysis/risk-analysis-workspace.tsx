"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BrainCircuit,
  CalendarDays,
  Database,
  Download,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./risk-analysis-workspace.module.css";

type PredictionRange = 3 | 7 | 15;
type DetailTab = "count" | "environment" | "impact" | "lag";

interface ForecastPoint {
  date: string;
  fullDate: string;
  actual?: number;
  predicted: number;
  lower: number;
  upper: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  pressure: number;
  risk: number;
  lag: number;
}

interface ModelFactor {
  name: string;
  value: number;
  direction: "increase" | "decrease";
}

const ranges: PredictionRange[] = [3, 7, 15];

const historicalPoints: ForecastPoint[] = [
  { date: "08/07", fullDate: "2026-08-07", actual: 94, predicted: 94, lower: 94, upper: 94, temperature: 28.1, humidity: 74, rainfall: 0, pressure: 1006, risk: 38, lag: 86 },
  { date: "08/08", fullDate: "2026-08-08", actual: 101, predicted: 101, lower: 101, upper: 101, temperature: 28.8, humidity: 72, rainfall: 0, pressure: 1005, risk: 43, lag: 94 },
  { date: "08/09", fullDate: "2026-08-09", actual: 98, predicted: 98, lower: 98, upper: 98, temperature: 29.2, humidity: 77, rainfall: 2.6, pressure: 1004, risk: 41, lag: 101 },
  { date: "08/10", fullDate: "2026-08-10", actual: 112, predicted: 112, lower: 112, upper: 112, temperature: 29.7, humidity: 75, rainfall: 0.4, pressure: 1003, risk: 51, lag: 98 },
  { date: "08/11", fullDate: "2026-08-11", actual: 119, predicted: 119, lower: 119, upper: 119, temperature: 30.1, humidity: 71, rainfall: 0, pressure: 1004, risk: 57, lag: 112 },
  { date: "08/12", fullDate: "2026-08-12", actual: 116, predicted: 116, lower: 116, upper: 116, temperature: 29.5, humidity: 78, rainfall: 4.8, pressure: 1002, risk: 55, lag: 119 },
  { date: "08/13", fullDate: "2026-08-13", actual: 126, predicted: 126, lower: 126, upper: 126, temperature: 30.4, humidity: 76, rainfall: 0.2, pressure: 1001, risk: 63, lag: 116 },
];

const predictionPoints: ForecastPoint[] = [
  { date: "08/14", fullDate: "2026-08-14", predicted: 137, lower: 128, upper: 146, temperature: 30.8, humidity: 77, rainfall: 0, pressure: 1001, risk: 69, lag: 126 },
  { date: "08/15", fullDate: "2026-08-15", predicted: 143, lower: 132, upper: 154, temperature: 31.2, humidity: 75, rainfall: 0, pressure: 1000, risk: 73, lag: 137 },
  { date: "08/16", fullDate: "2026-08-16", predicted: 149, lower: 136, upper: 162, temperature: 31.5, humidity: 78, rainfall: 1.2, pressure: 999, risk: 76, lag: 143 },
  { date: "08/17", fullDate: "2026-08-17", predicted: 146, lower: 132, upper: 160, temperature: 30.3, humidity: 83, rainfall: 8.4, pressure: 998, risk: 72, lag: 149 },
  { date: "08/18", fullDate: "2026-08-18", predicted: 157, lower: 141, upper: 173, temperature: 30.9, humidity: 80, rainfall: 2.1, pressure: 999, risk: 79, lag: 146 },
  { date: "08/19", fullDate: "2026-08-19", predicted: 168, lower: 150, upper: 186, temperature: 31.7, humidity: 76, rainfall: 0, pressure: 1000, risk: 84, lag: 157 },
  { date: "08/20", fullDate: "2026-08-20", predicted: 164, lower: 145, upper: 183, temperature: 30.6, humidity: 82, rainfall: 5.7, pressure: 999, risk: 81, lag: 168 },
  { date: "08/21", fullDate: "2026-08-21", predicted: 171, lower: 150, upper: 192, temperature: 31.1, humidity: 79, rainfall: 1.5, pressure: 1000, risk: 85, lag: 164 },
  { date: "08/22", fullDate: "2026-08-22", predicted: 179, lower: 157, upper: 201, temperature: 31.8, humidity: 75, rainfall: 0, pressure: 1001, risk: 87, lag: 171 },
  { date: "08/23", fullDate: "2026-08-23", predicted: 175, lower: 151, upper: 199, temperature: 30.4, humidity: 84, rainfall: 9.2, pressure: 998, risk: 83, lag: 179 },
  { date: "08/24", fullDate: "2026-08-24", predicted: 188, lower: 162, upper: 214, temperature: 31.3, humidity: 81, rainfall: 2.4, pressure: 999, risk: 89, lag: 175 },
  { date: "08/25", fullDate: "2026-08-25", predicted: 196, lower: 168, upper: 224, temperature: 32.1, humidity: 76, rainfall: 0, pressure: 1000, risk: 91, lag: 188 },
  { date: "08/26", fullDate: "2026-08-26", predicted: 190, lower: 160, upper: 220, temperature: 31.2, humidity: 82, rainfall: 4.6, pressure: 999, risk: 88, lag: 196 },
  { date: "08/27", fullDate: "2026-08-27", predicted: 184, lower: 153, upper: 215, temperature: 30.7, humidity: 85, rainfall: 10.1, pressure: 998, risk: 84, lag: 190 },
  { date: "08/28", fullDate: "2026-08-28", predicted: 181, lower: 149, upper: 213, temperature: 30.9, humidity: 80, rainfall: 1.8, pressure: 1000, risk: 82, lag: 184 },
];

const factors: ModelFactor[] = [
  { name: "温度", value: 86, direction: "increase" },
  { name: "相对湿度", value: 72, direction: "increase" },
  { name: "降雨量", value: 48, direction: "decrease" },
  { name: "气压", value: 31, direction: "decrease" },
  { name: "风速", value: 38, direction: "decrease" },
  { name: "土壤温度", value: 79, direction: "increase" },
  { name: "土壤湿度", value: 66, direction: "increase" },
  { name: "光照强度", value: 58, direction: "increase" },
  { name: "日照时长", value: 63, direction: "increase" },
  { name: "昼夜温差", value: 42, direction: "decrease" },
  { name: "前 1 日诱集量", value: 92, direction: "increase" },
  { name: "前 3 日均值", value: 89, direction: "increase" },
  { name: "前 7 日均值", value: 81, direction: "increase" },
  { name: "诱集增速", value: 84, direction: "increase" },
  { name: "连续高温天数", value: 74, direction: "increase" },
  { name: "降雨滞后", value: 53, direction: "decrease" },
  { name: "湿度滞后", value: 69, direction: "increase" },
  { name: "季节项", value: 77, direction: "increase" },
];

const detailTabs: ReadonlyArray<{ id: DetailTab; label: string; english: string }> = [
  { id: "count", label: "数量预测", english: "COUNT" },
  { id: "environment", label: "未来环境", english: "WEATHER" },
  { id: "impact", label: "环境影响", english: "IMPACT" },
  { id: "lag", label: "滞后效应", english: "LAG" },
];

type CanvasStyle = CSSProperties & {
  "--risk-canvas-height": string;
  "--risk-canvas-scale": number;
};

const MOBILE_CANVAS_WIDTH = 920;

const tooltipStyle: CSSProperties = {
  color: "var(--foreground)",
  background: "color-mix(in srgb, var(--card) 94%, transparent)",
  border: "1px solid color-mix(in srgb, var(--foreground) 15%, transparent)",
  borderRadius: 12,
  boxShadow: "0 14px 34px rgba(0,0,0,.2)",
  fontSize: 11,
};

export function RiskAnalysisWorkspace() {
  const [range, setRange] = useState<PredictionRange>(7);
  const [detailTab, setDetailTab] = useState<DetailTab>("count");
  const [selectedDate, setSelectedDate] = useState("2026-08-19");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshLabel, setRefreshLabel] = useState("模型更新于 21:00");
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const visibleForecast = useMemo(
    () => predictionPoints.slice(0, range),
    [range],
  );
  const trendData = useMemo(
    () => [...historicalPoints, ...visibleForecast],
    [visibleForecast],
  );
  const highestRiskPoint = useMemo(
    () => visibleForecast.reduce((highest, point) => point.risk > highest.risk ? point : highest),
    [visibleForecast],
  );
  const peakPoint = useMemo(
    () => visibleForecast.reduce((highest, point) => point.predicted > highest.predicted ? point : highest),
    [visibleForecast],
  );
  const selectedPoint =
    visibleForecast.find((point) => point.fullDate === selectedDate) ?? highestRiskPoint;

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
    const frame = window.requestAnimationFrame(updateCanvas);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [range, detailTab]);

  function updateRange(nextRange: PredictionRange) {
    setRange(nextRange);
    const nextPoints = predictionPoints.slice(0, nextRange);
    const nextHighest = nextPoints.reduce((highest, point) => point.risk > highest.risk ? point : highest);
    setSelectedDate(nextHighest.fullDate);
  }

  function refreshForecast() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    window.setTimeout(() => {
      const time = new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date());
      setRefreshLabel(`刚刚刷新 · ${time}`);
      setIsRefreshing(false);
    }, 650);
  }

  function exportForecast() {
    const header = ["日期", "预测数量", "预测下限", "预测上限", "温度", "相对湿度", "降雨量", "风险概率"];
    const rows = visibleForecast.map((point) => [
      point.fullDate,
      point.predicted,
      point.lower,
      point.upper,
      point.temperature,
      point.humidity,
      point.rainfall,
      `${point.risk}%`,
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fire-ant-risk-${range}d.csv`;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function selectDetailTab(nextTab: DetailTab) {
    setDetailTab(nextTab);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + detailTabs.length) % detailTabs.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % detailTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = detailTabs.length - 1;
    selectDetailTab(detailTabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      ref={canvasViewportRef}
      className={styles.canvasViewport}
      style={{
        "--risk-canvas-height": `${canvasHeight}px`,
        "--risk-canvas-scale": canvasScale,
      } as CanvasStyle}
    >
      <div ref={canvasRef} className={styles.canvas}>
        <section className={styles.statusLead} aria-label="当前风险状态">
          <div className={styles.statusCopy}>
            <span className={styles.eyebrow}>FORECAST STATUS</span>
            <strong>未来 {range} 天风险持续抬升</strong>
            <p>田间监测与环境因子联合预测</p>
          </div>
          <div className={styles.riskState}>
            <span aria-hidden="true" />
            <div>
              <small>当前状态</small>
              <strong>中高风险</strong>
            </div>
            <b>{highestRiskPoint.risk}%</b>
          </div>
        </section>

        <section className={`${styles.card} ${styles.trendCard}`} aria-labelledby="trend-analysis-title">
          <div className={styles.cardHeading}>
            <div>
              <span className={styles.eyebrow}>OBSERVED + FORECAST</span>
              <h2 id="trend-analysis-title">小火蚁数量趋势分析</h2>
              <p>实际监测值与模型预测值的连续变化</p>
            </div>
            <div className={styles.cardActions}>
              <span className={styles.refreshState} role="status" aria-live="polite">{refreshLabel}</span>
              <button type="button" onClick={refreshForecast} disabled={isRefreshing}>
                <RefreshCw size={14} className={isRefreshing ? styles.spinning : undefined} aria-hidden="true" />
                {isRefreshing ? "刷新中" : "刷新"}
              </button>
              <button type="button" onClick={exportForecast}>
                <Download size={14} aria-hidden="true" />
                导出
              </button>
            </div>
          </div>

          <div className={styles.trendSummary}>
            <SummaryMetric label="有效记录" value="126" unit="条" />
            <SummaryMetric label="平均数量" value="109" unit="只 / 次" />
            <SummaryMetric label="最高数量" value="126" unit="只" />
            <SummaryMetric label="高密度" value="18" unit="次" tone="amber" />
            <SummaryMetric label="快速增长" value="6" unit="次" tone="red" />
          </div>

          <div className={styles.trendChart}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 14, right: 12, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="riskForecastFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeOpacity={0.42} vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} minTickGap={26} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} domain={[70, 220]} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--foreground)", marginBottom: 5 }} />
                <ReferenceLine x="08/13" stroke="var(--muted-foreground)" strokeDasharray="4 6" strokeOpacity={0.65} />
                <Area type="monotone" dataKey="predicted" name="模型预测" stroke="none" fill="url(#riskForecastFill)" isAnimationActive />
                <Line type="monotone" dataKey="actual" name="实际监测" stroke="var(--chart-2)" strokeWidth={2.2} dot={{ r: 2.5, fill: "var(--chart-2)" }} connectNulls={false} />
                <Line type="monotone" dataKey="predicted" name="模型预测" stroke="var(--chart-1)" strokeWidth={2.2} strokeDasharray="6 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartLegend}>
            <span><i data-tone="actual" />实际监测</span>
            <span><i data-tone="forecast" />模型预测</span>
            <span className={styles.forecastBoundary}>08/13 后为预测区间</span>
          </div>
        </section>

        <section className={styles.analysisSection} aria-labelledby="risk-result-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>RISK RESULT</span>
              <h2 id="risk-result-title">风险分析结果</h2>
            </div>
            <div className={styles.rangeTabs} aria-label="预测周期">
              {ranges.map((item) => (
                <button
                  type="button"
                  aria-pressed={range === item}
                  className={range === item ? styles.activeRange : undefined}
                  onClick={() => updateRange(item)}
                  key={item}
                >
                  {item} 天
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.card} ${styles.sourceCard}`}>
            <div className={styles.sourceIcon}><Database size={17} aria-hidden="true" /></div>
            <div>
              <strong>预测来源</strong>
              <p>当前设备 ANTV-FIELD-01 的连续诱集记录与环境监测数据</p>
            </div>
            <div className={styles.sourceMeta}>
              <span>模拟模型</span>
              <strong>FireAnt Ensemble v0.8</strong>
            </div>
            <span className={styles.simulationBadge}>SIMULATION</span>
          </div>

          <div className={styles.metricGrid}>
            <PredictionMetric icon={ShieldAlert} label="最高风险" value={riskLabel(highestRiskPoint.risk)} meta={highestRiskPoint.date} tone="risk" />
            <PredictionMetric icon={Gauge} label="最大风险概率" value={`${highestRiskPoint.risk}%`} meta={`未来 ${range} 天`} />
            <PredictionMetric icon={TrendingUp} label="数量峰值" value={`${peakPoint.predicted}`} unit="只" meta={peakPoint.date} />
            <PredictionMetric icon={CalendarDays} label="训练数据截止" value="08/13" meta="2026 · 已校验" />
          </div>
        </section>

        <section className={`${styles.card} ${styles.interpretationCard}`} aria-labelledby="model-interpretation-title">
          <div className={styles.cardHeading}>
            <div>
              <span className={styles.eyebrow}>MODEL INTERPRETATION</span>
              <h2 id="model-interpretation-title">模型综合解读</h2>
              <p>从趋势、风险与驱动因子解释预测结果</p>
            </div>
            <BrainCircuit size={22} strokeWidth={1.5} aria-hidden="true" />
          </div>

          <div className={styles.interpretationStats}>
            <div><span>周期趋势结论</span><strong>持续上升后高位波动</strong></div>
            <div><span>数量净变化</span><strong>+{visibleForecast.at(-1)!.predicted - historicalPoints.at(-1)!.actual!} 只</strong></div>
            <div><span>风险峰值</span><strong>{highestRiskPoint.date} · {highestRiskPoint.risk}%</strong></div>
            <div><span>预测区间变化</span><strong>±9 → ±{peakPoint.upper - peakPoint.predicted} 只</strong></div>
          </div>

          <div className={styles.driverSummary}>
            <div>
              <span className={styles.driverLabel} data-tone="increase">增加数量的关键驱动</span>
              <p>连续高温、前 3 日诱集均值与土壤温度共同推高活跃度。</p>
            </div>
            <div>
              <span className={styles.driverLabel} data-tone="decrease">减少数量的关键驱动</span>
              <p>短时强降雨与风速升高会抑制地表活动，但作用存在滞后。</p>
            </div>
          </div>

          <div className={styles.factorExplorer}>
            <div className={styles.factorHeader}>
              <div>
                <strong>逐日模型因子</strong>
                <span>选择日期查看数量、环境、风险与全部 18 项输入</span>
              </div>
              <div className={styles.datePicker} aria-label="预测日期">
                {visibleForecast.map((point) => (
                  <button
                    type="button"
                    aria-pressed={selectedPoint.fullDate === point.fullDate}
                    className={selectedPoint.fullDate === point.fullDate ? styles.activeDate : undefined}
                    onClick={() => setSelectedDate(point.fullDate)}
                    key={point.fullDate}
                  >
                    {point.date}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.selectedDaySummary}>
              <div><span>预测数量</span><strong>{selectedPoint.predicted} 只</strong></div>
              <div><span>环境</span><strong>{selectedPoint.temperature}°C · {selectedPoint.humidity}%RH</strong></div>
              <div><span>降雨</span><strong>{selectedPoint.rainfall} mm</strong></div>
              <div><span>风险</span><strong>{selectedPoint.risk}% · {riskLabel(selectedPoint.risk)}</strong></div>
            </div>

            <div className={styles.factorGrid}>
              {factors.map((factor) => (
                <div className={styles.factorItem} key={factor.name}>
                  <div>
                    <span>{factor.name}</span>
                    <b data-direction={factor.direction}>{factor.value}</b>
                  </div>
                  <i><span data-direction={factor.direction} style={{ width: `${factor.value}%` }} /></i>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.aiExplanation} aria-labelledby="ai-explanation-title">
          <div className={styles.aiTitle}>
            <Sparkles size={18} aria-hidden="true" />
            <div>
              <span className={styles.eyebrow}>PLAIN LANGUAGE</span>
              <h2 id="ai-explanation-title">AI 通俗解读</h2>
            </div>
          </div>
          <div className={styles.aiColumns}>
            <div><span>整体判断</span><p>未来一段时间，小火蚁活动强度大概率继续上升，并在中后段进入高位波动。</p></div>
            <div><span>为什么</span><p>近期诱集量已经形成连续上升惯性，同时高温和偏高湿度更适合其地表活动。</p></div>
            <div><span>可信程度</span><p>当前判断可信度较高；预测越靠后，不确定范围会逐渐扩大。</p></div>
          </div>
        </section>

        <section className={`${styles.card} ${styles.detailCard}`} aria-labelledby="detail-view-title">
          <div className={styles.detailHeader}>
            <div>
              <span className={styles.eyebrow}>DETAILED FORECAST</span>
              <h2 id="detail-view-title">详细预测视图</h2>
            </div>
            <div className={styles.detailTabs} role="tablist" aria-label="详细预测维度">
              {detailTabs.map((tab, index) => (
                <button
                  ref={(element) => { tabRefs.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`detail-tab-${tab.id}`}
                  aria-controls={`detail-panel-${tab.id}`}
                  aria-selected={detailTab === tab.id}
                  tabIndex={detailTab === tab.id ? 0 : -1}
                  className={detailTab === tab.id ? styles.activeDetailTab : undefined}
                  onClick={() => selectDetailTab(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  key={tab.id}
                >
                  {tab.label}<small>{tab.english}</small>
                </button>
              ))}
            </div>
          </div>

          <div
            className={styles.detailPanel}
            role="tabpanel"
            id={`detail-panel-${detailTab}`}
            aria-labelledby={`detail-tab-${detailTab}`}
          >
            <div className={styles.detailChart}>
              <DetailChart tab={detailTab} data={visibleForecast} />
            </div>
            <aside className={styles.modelBreakdown}>
              <span className={styles.eyebrow}>HIGHEST RISK DAY</span>
              <strong>{highestRiskPoint.date}</strong>
              <p>{highestRiskPoint.risk}% 风险概率 · {highestRiskPoint.predicted} 只预测数量</p>
              <div className={styles.probabilityList}>
                <Probability label="梯度提升模型" value={42} />
                <Probability label="时序回归模型" value={33} />
                <Probability label="环境分类模型" value={25} />
              </div>
            </aside>
          </div>

          <div className={styles.tableHeader}>
            <strong>逐日预测数据</strong>
            <span>显示未来 {range} 天 · 模拟输出</span>
          </div>
          <div className={styles.tableScroller} tabIndex={0} aria-label="逐日预测数据表，可横向滚动">
            <table>
              <thead>
                <tr>
                  <th>日期</th><th>预测数量</th><th>预测区间</th><th>温度</th><th>相对湿度</th><th>降雨</th><th>风险概率</th><th>风险等级</th>
                </tr>
              </thead>
              <tbody>
                {visibleForecast.map((point) => (
                  <tr key={point.fullDate}>
                    <td>{point.fullDate}</td>
                    <td><strong>{point.predicted}</strong> 只</td>
                    <td>{point.lower} - {point.upper}</td>
                    <td>{point.temperature}°C</td>
                    <td>{point.humidity}%</td>
                    <td>{point.rainfall} mm</td>
                    <td>{point.risk}%</td>
                    <td><span className={styles.riskPill} data-level={riskLevel(point.risk)}>{riskLabel(point.risk)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryMetric({ label, value, unit, tone }: { label: string; value: string; unit: string; tone?: "amber" | "red" }) {
  return <div className={styles.summaryMetric} data-tone={tone}><span>{label}</span><strong>{value}</strong><small>{unit}</small></div>;
}

function PredictionMetric({ icon: Icon, label, value, unit, meta, tone }: { icon: typeof Gauge; label: string; value: string; unit?: string; meta: string; tone?: "risk" }) {
  return (
    <div className={styles.predictionMetric} data-tone={tone}>
      <div><Icon size={17} aria-hidden="true" /><span>{label}</span></div>
      <strong>{value}<small>{unit}</small></strong>
      <p>{meta}</p>
    </div>
  );
}

function Probability({ label, value }: { label: string; value: number }) {
  return <div className={styles.probability}><div><span>{label}</span><b>{value}%</b></div><i><span style={{ width: `${value}%` }} /></i></div>;
}

function DetailChart({ tab, data }: { tab: DetailTab; data: ForecastPoint[] }) {
  if (tab === "environment") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 18, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.42} vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
          <YAxis yAxisId="temperature" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} domain={[26, 34]} />
          <YAxis yAxisId="humidity" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} domain={[60, 90]} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar yAxisId="humidity" dataKey="humidity" name="相对湿度" fill="var(--chart-2)" fillOpacity={0.2} radius={[4, 4, 0, 0]} />
          <Line yAxisId="temperature" type="monotone" dataKey="temperature" name="温度" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (tab === "impact") {
    const impactData = factors.slice(0, 8).map((factor) => ({
      name: factor.name,
      impact: factor.direction === "increase" ? Math.round(factor.value / 6) : -Math.round(factor.value / 7),
    }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={impactData} layout="vertical" margin={{ top: 6, right: 18, bottom: 0, left: 18 }}>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.42} horizontal={false} />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} width={72} />
          <Tooltip contentStyle={tooltipStyle} />
          <ReferenceLine x={0} stroke="var(--muted-foreground)" strokeOpacity={0.6} />
          <Bar dataKey="impact" name="数量影响" radius={4}>
            {impactData.map((item) => <Cell key={item.name} fill={item.impact >= 0 ? "var(--chart-1)" : "var(--chart-2)"} fillOpacity={0.75} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (tab === "lag") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 18, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.42} vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} domain={[90, 210]} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="lag" name="前一日监测" stroke="var(--chart-2)" strokeWidth={1.7} strokeDasharray="4 4" dot={false} />
          <Line type="monotone" dataKey="predicted" name="当日预测" stroke="var(--chart-1)" strokeWidth={2.2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  const countData = data.map((point) => ({ ...point, interval: [point.lower, point.upper] }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={countData} margin={{ top: 18, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="var(--border)" strokeOpacity={0.42} vertical={false} />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} domain={[100, 230]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="interval" name="预测区间" stroke="none" fill="var(--chart-1)" fillOpacity={0.13} />
        <Area type="monotone" dataKey="predicted" name="预测数量" stroke="var(--chart-1)" strokeWidth={2.2} fill="transparent" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function riskLabel(risk: number) {
  if (risk >= 85) return "高风险";
  if (risk >= 65) return "中高风险";
  return "中风险";
}

function riskLevel(risk: number) {
  if (risk >= 85) return "high";
  if (risk >= 65) return "elevated";
  return "medium";
}
