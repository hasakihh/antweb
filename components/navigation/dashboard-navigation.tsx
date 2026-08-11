"use client";

import {
  CloudSun,
  LayoutDashboard,
  Map,
  Settings2,
  ShieldAlert,
} from "lucide-react";
import {
  RadialOrbitalNavigation,
  type OrbitNavigationItem,
} from "@/components/ui/radial-orbital-navigation";

export const dashboardNavigationItems = [
  {
    id: "overview",
    label: "概览",
    englishLabel: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
  },
  {
    id: "environment",
    label: "环境",
    englishLabel: "Environment",
    href: "/environment",
    icon: CloudSun,
  },
  {
    id: "map",
    label: "地图",
    englishLabel: "Map",
    href: "/map",
    icon: Map,
  },
  {
    id: "risk-analysis",
    label: "风险分析",
    englishLabel: "Risk Analysis",
    href: "/risk-analysis",
    icon: ShieldAlert,
  },
  {
    id: "settings",
    label: "用户设置",
    englishLabel: "Settings",
    href: "/settings",
    icon: Settings2,
  },
] as const satisfies readonly OrbitNavigationItem[];

export function DashboardNavigation() {
  return <RadialOrbitalNavigation items={dashboardNavigationItems} />;
}
