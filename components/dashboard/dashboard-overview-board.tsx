"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  ArrowUpRight,
  Bug,
  Droplets,
  ShieldAlert,
  Thermometer,
} from "lucide-react";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { useEnvironmentData } from "@/components/environment/environment-data-provider";
import classes from "./dashboard-overview-board.module.css";

type RangeKey = "day" | "week" | "month" | "year";
type DashboardDetail = "environment" | "capture" | "risk";

const detailBySummaryItem: Record<string, DashboardDetail> = {
  "environment-reading": "environment",
  "ant-capture-count": "capture",
  "risk-evaluation": "risk",
};

interface TrendPoint {
  label: string;
  antCount: number;
  temperature: number;
  humidity: number;
}

const rangeLabels: Record<RangeKey, string> = {
  day: "日",
  week: "周",
  month: "月",
  year: "年",
};

const rangeMeta: Record<RangeKey, string> = {
  day: "24 HOURS",
  week: "7 DAYS",
  month: "30 DAYS",
  year: "12 MONTHS",
};

const trendData: Record<RangeKey, TrendPoint[]> = {
  day: [
    { label: "00:00", antCount: 18, temperature: 24.1, humidity: 77 },
    { label: "03:00", antCount: 24, temperature: 23.7, humidity: 79 },
    { label: "06:00", antCount: 31, temperature: 24.6, humidity: 76 },
    { label: "09:00", antCount: 55, temperature: 27.2, humidity: 69 },
    { label: "12:00", antCount: 74, temperature: 29.1, humidity: 62 },
    { label: "15:00", antCount: 98, temperature: 28.6, humidity: 64 },
    { label: "18:00", antCount: 112, temperature: 27.4, humidity: 68 },
    { label: "21:00", antCount: 126, temperature: 26.4, humidity: 71 },
  ],
  week: [
    { label: "周一", antCount: 62, temperature: 25.2, humidity: 74 },
    { label: "周二", antCount: 78, temperature: 26.1, humidity: 72 },
    { label: "周三", antCount: 71, temperature: 25.8, humidity: 75 },
    { label: "周四", antCount: 94, temperature: 27.3, humidity: 68 },
    { label: "周五", antCount: 88, temperature: 28.1, humidity: 65 },
    { label: "周六", antCount: 117, temperature: 27.6, humidity: 67 },
    { label: "周日", antCount: 126, temperature: 26.4, humidity: 71 },
  ],
  month: [
    { label: "08/01", antCount: 44, temperature: 25.1, humidity: 76 },
    { label: "08/04", antCount: 58, temperature: 25.8, humidity: 73 },
    { label: "08/07", antCount: 53, temperature: 26.4, humidity: 71 },
    { label: "08/10", antCount: 79, temperature: 27.8, humidity: 66 },
    { label: "08/13", antCount: 91, temperature: 28.4, humidity: 63 },
    { label: "08/16", antCount: 84, temperature: 27.1, humidity: 69 },
    { label: "08/19", antCount: 103, temperature: 28.7, humidity: 62 },
    { label: "08/22", antCount: 96, temperature: 27.9, humidity: 65 },
    { label: "08/25", antCount: 118, temperature: 27.2, humidity: 68 },
    { label: "08/28", antCount: 126, temperature: 26.4, humidity: 71 },
  ],
  year: [
    { label: "9月", antCount: 41, temperature: 24.3, humidity: 78 },
    { label: "10月", antCount: 49, temperature: 23.8, humidity: 76 },
    { label: "11月", antCount: 38, temperature: 22.9, humidity: 73 },
    { label: "12月", antCount: 35, temperature: 21.7, humidity: 71 },
    { label: "1月", antCount: 46, temperature: 22.4, humidity: 72 },
    { label: "2月", antCount: 57, temperature: 23.6, humidity: 74 },
    { label: "3月", antCount: 69, temperature: 24.8, humidity: 76 },
    { label: "4月", antCount: 81, temperature: 26.2, humidity: 72 },
    { label: "5月", antCount: 97, temperature: 27.5, humidity: 67 },
    { label: "6月", antCount: 112, temperature: 28.3, humidity: 64 },
    { label: "7月", antCount: 119, temperature: 27.7, humidity: 66 },
    { label: "8月", antCount: 126, temperature: 26.4, humidity: 71 },
  ],
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function RangeTabs({
  activeRange,
  onChange,
}: {
  activeRange: RangeKey;
  onChange: (range: RangeKey) => void;
}) {
  return (
    <div className={classes.rangeTabs} aria-label="趋势时间范围">
      {(Object.keys(rangeLabels) as RangeKey[]).map((range) => (
        <button
          className={range === activeRange ? classes.activeRange : ""}
          type="button"
          aria-pressed={range === activeRange}
          title={`查看${rangeLabels[range]}趋势`}
          onClick={() => onChange(range)}
          key={range}
        >
          {rangeLabels[range]}
        </button>
      ))}
    </div>
  );
}

export function DashboardOverviewBoard() {
  const { snapshot } = useEnvironmentData();
  const [range, setRange] = useState<RangeKey>("week");
  const [isSwitching, setIsSwitching] = useState(false);
  const [activeDetail, setActiveDetail] = useState<DashboardDetail | null>(null);
  const [transitioningItemId, setTransitioningItemId] = useState<string | null>(
    null,
  );
  const [isDetailClosing, setIsDetailClosing] = useState(false);
  const switchTimerRef = useRef<number | null>(null);
  const detailTimerRef = useRef<number | null>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const data = trendData[range];
  const latestEnvironment = snapshot.latest;
  const currentTemperature = latestEnvironment?.temperature ?? 0;
  const currentHumidity = latestEnvironment?.relativeHumidity ?? 0;
  const temperatureDelta = snapshot.temperatureDelta;
  const humidityDelta = snapshot.humidityDelta;
  const signedValue = (value: number | null, suffix: string) => {
    if (value === null) return `--${suffix}`;
    return `${value > 0 ? "+" : ""}${value}${suffix}`;
  };

  useEffect(
    () => () => {
      if (switchTimerRef.current !== null) {
        window.clearTimeout(switchTimerRef.current);
      }
      if (detailTimerRef.current !== null) {
        window.clearTimeout(detailTimerRef.current);
      }
    },
    [],
  );

  function changeRange(nextRange: RangeKey) {
    if (nextRange === range) return;
    if (switchTimerRef.current !== null) {
      window.clearTimeout(switchTimerRef.current);
    }

    setIsSwitching(true);
    switchTimerRef.current = window.setTimeout(() => {
      setRange(nextRange);
      setIsSwitching(false);
      switchTimerRef.current = null;
    }, prefersReducedMotion ? 0 : 180);
  }

  function openDetail(itemId: string) {
    const nextDetail = detailBySummaryItem[itemId];
    if (!nextDetail || activeDetail || transitioningItemId) return;

    setTransitioningItemId(itemId);
    setActiveDetail(nextDetail);
    detailTimerRef.current = window.setTimeout(
      () => {
        setTransitioningItemId(null);
        detailTimerRef.current = null;
      },
      prefersReducedMotion ? 0 : 540,
    );
  }

  function closeDetail() {
    if (!activeDetail || isDetailClosing) return;

    if (detailTimerRef.current !== null) {
      window.clearTimeout(detailTimerRef.current);
      detailTimerRef.current = null;
    }

    setTransitioningItemId(null);
    setIsDetailClosing(true);
    detailTimerRef.current = window.setTimeout(
      () => {
        setActiveDetail(null);
        setIsDetailClosing(false);
        detailTimerRef.current = null;
      },
      prefersReducedMotion ? 0 : 260,
    );
  }

  const items: BentoItem[] = [
    {
      id: "environment-reading",
      title: "环境温湿度",
      description: "监测点当前环境读数",
      icon: <Thermometer size={17} strokeWidth={1.6} />,
      status: "稳定",
      tone: "cyan",
      colSpan: 4,
      content: (
        <div className={classes.metricBody}>
          <div className={classes.metricValue}>
            <strong>{currentTemperature.toFixed(1)}</strong>
            <span>°C</span>
          </div>
          <div className={classes.secondaryMetric}>
            <Droplets size={12} strokeWidth={1.7} aria-hidden="true" />
            <strong>{currentHumidity}%</strong>
            <span>RH</span>
          </div>
          <small>
            较前一小时 {signedValue(temperatureDelta, "°C")} / {signedValue(humidityDelta, "% RH")}
          </small>
        </div>
      ),
    },
    {
      id: "ant-capture-count",
      title: "诱集数量",
      description: "今日监测装置累计记录",
      icon: <Bug size={17} strokeWidth={1.6} />,
      status: "今日",
      tone: "amber",
      colSpan: 4,
      content: (
        <div className={classes.metricBody}>
          <div className={classes.metricValue}>
            <strong>126</strong>
            <span>只</span>
          </div>
          <div className={classes.metricDelta}>
            <ArrowUpRight size={13} strokeWidth={1.7} aria-hidden="true" />
            <span>较昨日同期 +18</span>
          </div>
          <small>最近记录 21:00</small>
        </div>
      ),
    },
    {
      id: "risk-evaluation",
      title: "风险评判",
      description: "综合诱集密度与环境条件",
      icon: <ShieldAlert size={17} strokeWidth={1.6} />,
      status: "需关注",
      tone: "green",
      colSpan: 4,
      content: (
        <div className={classes.riskBody}>
          <div>
            <strong>中风险</strong>
            <span>指数 62 / 100</span>
          </div>
          <div className={classes.riskScale} aria-label="风险指数 62，共 100">
            <i />
          </div>
          <small>诱集密度接近预警阈值</small>
        </div>
      ),
    },
    {
      id: "capture-trend",
      title: "诱集发生趋势",
      description: "小火蚁诱集数量随时间变化",
      meta: rangeMeta[range],
      icon: <Bug size={17} strokeWidth={1.6} />,
      tone: "amber",
      colSpan: 12,
      hasPersistentHover: true,
      headerAction: <RangeTabs activeRange={range} onChange={changeRange} />,
      content: (
        <div
          className={`${classes.chartBody} ${
            isSwitching ? classes.switching : ""
          }`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 18, right: 10, bottom: 2, left: -16 }}
            >
              <defs>
                <linearGradient id="ant-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d8a347" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="#d8a347" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray="3 7"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#777772", fontSize: 8 }}
                minTickGap={20}
                dy={8}
              />
              <YAxis
                width={38}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#777772", fontSize: 8 }}
                domain={[0, 140]}
                ticks={[0, 40, 80, 120]}
              />
              <Tooltip
                cursor={{
                  stroke: "rgba(216,163,71,0.42)",
                  strokeDasharray: "3 4",
                }}
                contentStyle={{
                  background: "rgba(13,13,13,0.94)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  borderRadius: 5,
                  color: "#f2f2ed",
                  fontSize: 10,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.34)",
                }}
                labelStyle={{ color: "#969690", marginBottom: 4 }}
                formatter={(value) => [`${value} 只`, "诱集数量"]}
              />
              <Area
                key={`ant-${range}`}
                type="monotone"
                dataKey="antCount"
                name="诱集数量"
                stroke="#d8a347"
                strokeWidth={1.8}
                fill="url(#ant-area-gradient)"
                dot={false}
                activeDot={{
                  r: 3.5,
                  fill: "#0b0b0b",
                  stroke: "#e5b55f",
                  strokeWidth: 2,
                }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={650}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ),
    },
    {
      id: "environment-trend",
      title: "温湿度波动分析",
      description: "温度与相对湿度的同步变化",
      meta: rangeMeta[range],
      icon: <Thermometer size={17} strokeWidth={1.6} />,
      tone: "cyan",
      colSpan: 12,
      headerAction: (
        <div className={classes.chartLegend} aria-label="图表图例">
          <span data-series="temperature">温度</span>
          <span data-series="humidity">湿度</span>
        </div>
      ),
      content: (
        <div
          className={`${classes.chartBody} ${
            isSwitching ? classes.switching : ""
          }`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 18, right: -4, bottom: 2, left: -16 }}
            >
              <defs>
                <linearGradient id="temperature-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#72b7ce" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#72b7ce" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray="3 7"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#777772", fontSize: 8 }}
                minTickGap={20}
                dy={8}
              />
              <YAxis
                yAxisId="temperature"
                width={38}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#72a7b8", fontSize: 8 }}
                domain={[20, 32]}
                ticks={[20, 24, 28, 32]}
              />
              <YAxis
                yAxisId="humidity"
                orientation="right"
                width={36}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#719486", fontSize: 8 }}
                domain={[40, 90]}
                ticks={[40, 60, 80]}
              />
              <Tooltip
                cursor={{
                  stroke: "rgba(255,255,255,0.2)",
                  strokeDasharray: "3 4",
                }}
                contentStyle={{
                  background: "rgba(13,13,13,0.94)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  borderRadius: 5,
                  color: "#f2f2ed",
                  fontSize: 10,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.34)",
                }}
                labelStyle={{ color: "#969690", marginBottom: 4 }}
                formatter={(value, name) =>
                  name === "temperature"
                    ? [`${value} °C`, "温度"]
                    : [`${value}%`, "湿度"]
                }
              />
              <Area
                key={`temperature-${range}`}
                yAxisId="temperature"
                type="monotone"
                dataKey="temperature"
                name="temperature"
                stroke="#72b7ce"
                strokeWidth={1.7}
                fill="url(#temperature-area-gradient)"
                dot={false}
                activeDot={{
                  r: 3.5,
                  fill: "#0b0b0b",
                  stroke: "#8dc6d8",
                  strokeWidth: 2,
                }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={650}
                animationEasing="ease-out"
              />
              <Line
                key={`humidity-${range}`}
                yAxisId="humidity"
                type="monotone"
                dataKey="humidity"
                name="humidity"
                stroke="#79aa98"
                strokeWidth={1.6}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{
                  r: 3.5,
                  fill: "#0b0b0b",
                  stroke: "#91baa9",
                  strokeWidth: 2,
                }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={650}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ),
    },
  ];

  const summaryItems = items.slice(0, 3).map((item) => ({
    ...item,
    colSpan: 12 as const,
  }));
  const activeSummaryItem = activeDetail
    ? summaryItems.find(
        (item) => detailBySummaryItem[item.id] === activeDetail,
      )
    : null;
  const activeChartItem =
    activeDetail === "environment"
      ? items.find((item) => item.id === "environment-trend")
      : activeDetail === "capture"
        ? items.find((item) => item.id === "capture-trend")
        : null;

  return (
    <section className={classes.board} aria-label="持续监测总览">
      <div
        className={`${classes.summaryLayer} ${
          activeDetail && !isDetailClosing ? classes.summaryLayerHidden : ""
        }`}
        aria-hidden={activeDetail ? true : undefined}
      >
        <BentoGrid
          disabled={activeDetail !== null}
          items={summaryItems}
          transitioningItemId={transitioningItemId}
          onItemSelect={openDetail}
        />
      </div>

      {activeDetail ? (
        <section
          className={`${classes.detailPanel} ${
            isDetailClosing ? classes.detailClosing : ""
          }`}
          data-detail={activeDetail}
          aria-labelledby="dashboard-detail-title"
        >
          <header className={classes.detailHeader}>
            <button
              className={classes.backButton}
              type="button"
              aria-label="返回Dashboard概览"
              onClick={closeDetail}
            >
              <ArrowLeft size={14} strokeWidth={1.7} aria-hidden="true" />
            </button>

            <span className={classes.detailIcon} aria-hidden="true">
              {activeSummaryItem?.icon}
            </span>

            <div className={classes.detailHeading}>
              <h2 id="dashboard-detail-title">{activeSummaryItem?.title}</h2>
              <small>
                {activeDetail === "environment"
                  ? "温湿度趋势"
                  : activeDetail === "capture"
                    ? "诱集发生趋势"
                    : "综合风险详情"}
              </small>
            </div>

            {activeDetail !== "risk" ? (
              <div className={classes.detailControls}>
                <RangeTabs activeRange={range} onChange={changeRange} />
              </div>
            ) : null}
          </header>

          {activeDetail === "risk" ? (
            <div className={classes.riskDetail}>
              <div className={classes.riskScore}>
                <span>当前风险</span>
                <strong>中风险</strong>
                <small>综合指数 62 / 100</small>
                <div className={classes.riskScale} aria-label="风险指数 62，共 100">
                  <i />
                </div>
              </div>

              <div className={classes.riskFactors} aria-label="风险影响因素">
                <div>
                  <span>诱集密度</span>
                  <strong>68</strong>
                  <i><b style={{ width: "68%" }} /></i>
                </div>
                <div>
                  <span>环境适宜度</span>
                  <strong>74</strong>
                  <i><b style={{ width: "74%" }} /></i>
                </div>
                <div>
                  <span>设备覆盖率</span>
                  <strong>92</strong>
                  <i><b style={{ width: "92%" }} /></i>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={classes.detailSummary}>
                {activeDetail === "environment" ? (
                  <>
                    <div>
                      <span>当前温度</span>
                      <strong>{currentTemperature.toFixed(1)} <small>°C</small></strong>
                    </div>
                    <div>
                      <span>当前湿度</span>
                      <strong>{currentHumidity} <small>% RH</small></strong>
                    </div>
                    <div className={classes.detailLegend}>
                      <span data-series="temperature">温度</span>
                      <span data-series="humidity">湿度</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span>当前累计</span>
                      <strong>126 <small>只</small></strong>
                    </div>
                    <div>
                      <span>较昨日同期</span>
                      <strong>+18 <small>只</small></strong>
                    </div>
                  </>
                )}
              </div>

              <div className={classes.detailCanvas}>{activeChartItem?.content}</div>
            </>
          )}
        </section>
      ) : null}
    </section>
  );
}
