"use client";

import type { CSSProperties, FocusEvent } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { LucideIcon } from "lucide-react";
import { Radar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./radial-orbital-navigation.module.css";

export type OrbitNavigationId =
  | "monitoring"
  | "environment"
  | "map"
  | "risk-analysis"
  | "settings";

export interface OrbitNavigationItem {
  id: OrbitNavigationId;
  label: string;
  englishLabel: string;
  href: string;
  icon: LucideIcon;
}

interface RadialOrbitalNavigationProps {
  items: readonly OrbitNavigationItem[];
}

type NodeStyle = CSSProperties & {
  transform: string;
};

const AUTO_ROTATION_STEP = 0.3;
const AUTO_ROTATION_INTERVAL_MS = 50;
const AUTO_ROTATION_RESUME_MS = 1500;

export function RadialOrbitalNavigation({
  items,
}: RadialOrbitalNavigationProps) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [orbitRadius, setOrbitRadius] = useState(120);
  const [isOrbitReady, setIsOrbitReady] = useState(false);
  const activeIndex = items.findIndex(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const isHubActive = pathname === "/overview";
  const angleStep = 360 / items.length;
  const [rotationAngle, setRotationAngle] = useState(
    () => -(activeIndex >= 0 ? activeIndex : 0) * angleStep,
  );
  const previousActiveIndexRef = useRef(activeIndex);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const updateRadius = () => {
      const nextRadius = Number.parseFloat(
        window.getComputedStyle(root).getPropertyValue("--orbit-radius"),
      );

      if (Number.isFinite(nextRadius)) {
        setOrbitRadius(nextRadius);
      }
    };

    const observer = new ResizeObserver(updateRadius);
    updateRadius();
    observer.observe(root);
    const readyFrame = window.requestAnimationFrame(() => setIsOrbitReady(true));

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(readyFrame);
    };
  }, []);

  useEffect(() => {
    if (
      !isAutoRotating ||
      isInteractionPaused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const rotationTimer = window.setInterval(() => {
      setRotationAngle((angle) =>
        Number(((angle + AUTO_ROTATION_STEP) % 360).toFixed(3)),
      );
    }, AUTO_ROTATION_INTERVAL_MS);

    return () => window.clearInterval(rotationTimer);
  }, [isAutoRotating, isInteractionPaused]);

  const rotateToIndex = useCallback(
    (index: number) => {
      setIsAutoRotating(false);
      setRotationAngle(-index * angleStep);

      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }

      resumeTimerRef.current = window.setTimeout(() => {
        setIsAutoRotating(true);
        resumeTimerRef.current = null;
      }, AUTO_ROTATION_RESUME_MS);
    },
    [angleStep],
  );

  useEffect(() => {
    const previousIndex = previousActiveIndexRef.current;
    previousActiveIndexRef.current = activeIndex;
    if (activeIndex < 0 || previousIndex === activeIndex) return;
    rotateToIndex(activeIndex);
  }, [activeIndex, rotateToIndex]);

  useEffect(
    () => () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    },
    [],
  );

  function resumeAfterFocusLeaves(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsInteractionPaused(false);
    }
  }

  function pauseForKeyboardFocus(event: FocusEvent<HTMLElement>) {
    if (
      event.target instanceof HTMLElement &&
      event.target.matches(":focus-visible")
    ) {
      setIsInteractionPaused(true);
    }
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <nav
        className={styles.navigation}
        aria-label="监测平台主导航"
        onMouseEnter={() => setIsInteractionPaused(true)}
        onMouseLeave={() => setIsInteractionPaused(false)}
        onFocusCapture={pauseForKeyboardFocus}
        onBlurCapture={resumeAfterFocusLeaves}
      >
        <div className={styles.orbitStage} id="dashboard-orbit-navigation">
          <span className={styles.outerRing} aria-hidden="true" />
          <span className={styles.innerRing} aria-hidden="true" />

          <ul
            className={`${styles.orbitList} ${
              isOrbitReady ? styles.orbitReady : ""
            }`}
          >
            {items.map((item, index) => {
              const angle = angleStep * index - 90 + rotationAngle;
              const radian = (angle * Math.PI) / 180;
              const x = Number((orbitRadius * Math.cos(radian)).toFixed(3));
              const y = Number((orbitRadius * Math.sin(radian)).toFixed(3));
              const isActive = index === activeIndex;
              const Icon = item.icon;
              const nodeStyle = {
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                zIndex: isActive ? 3 : 1,
              } as NodeStyle;

              return (
                <li className={styles.orbitItem} style={nodeStyle} key={item.id}>
                  <Link
                    className={`${styles.nodeLink} ${
                      isActive ? styles.activeNode : ""
                    }`}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => rotateToIndex(index)}
                  >
                    <span className={styles.nodeIcon} aria-hidden="true">
                      <Icon size={18} strokeWidth={1.7} />
                    </span>
                    <span className={styles.nodeCopy}>
                      <strong>{item.label}</strong>
                      <small>{item.englishLabel}</small>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <Link
          className={`${styles.hubLink} ${isHubActive ? styles.activeHub : ""}`}
          href="/overview"
          aria-label="返回 AI 会话工作台"
          aria-current={isHubActive ? "page" : undefined}
        >
          <Radar size={21} strokeWidth={1.5} aria-hidden="true" />
          <span>监测首页</span>
        </Link>
      </nav>
    </div>
  );
}
