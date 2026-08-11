"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Radar, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./radial-orbital-navigation.module.css";

export type OrbitNavigationId =
  | "overview"
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
  "--node-angle": string;
  "--node-angle-negative": string;
};

type OrbitStyle = CSSProperties & {
  "--orbit-rotation": string;
  "--orbit-counter-rotation": string;
};

export function RadialOrbitalNavigation({
  items,
}: RadialOrbitalNavigationProps) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const orbitListRef = useRef<HTMLUListElement>(null);
  const [openAtPathname, setOpenAtPathname] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const isMobileOpen = openAtPathname === pathname;
  const activeIndex = Math.max(
    0,
    items.findIndex(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    ),
  );
  const angleStep = 360 / items.length;
  const [rotationAngle, setRotationAngle] = useState(
    () => -activeIndex * angleStep,
  );
  const previousActiveIndexRef = useRef(activeIndex);

  useEffect(() => {
    const previousIndex = previousActiveIndexRef.current;
    if (previousIndex === activeIndex) return;
    previousActiveIndexRef.current = activeIndex;

    const orbitList = orbitListRef.current;
    if (!orbitList) return;

    const computedTransform = window.getComputedStyle(orbitList).transform;
    const matrix = new DOMMatrixReadOnly(computedTransform);
    const renderedAngle =
      (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
    const baseTarget = -activeIndex * angleStep;
    const nearestTarget =
      baseTarget + Math.round((renderedAngle - baseTarget) / 360) * 360;

    let snapFrame = 0;
    let resumeTimer = 0;
    const freezeFrame = window.requestAnimationFrame(() => {
      setIsAutoRotating(false);
      setRotationAngle(renderedAngle);

      snapFrame = window.requestAnimationFrame(() => {
        setRotationAngle(nearestTarget);
      });

      resumeTimer = window.setTimeout(() => {
        setIsAutoRotating(true);
      }, 1500);
    });

    return () => {
      window.cancelAnimationFrame(freezeFrame);
      window.cancelAnimationFrame(snapFrame);
      window.clearTimeout(resumeTimer);
    };
  }, [activeIndex, angleStep, items.length]);

  useEffect(() => {
    if (!isMobileOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpenAtPathname(null);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenAtPathname(null);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileOpen]);

  const orbitStyle = {
    "--orbit-rotation": `${rotationAngle}deg`,
    "--orbit-counter-rotation": `${-rotationAngle}deg`,
  } as OrbitStyle;

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${isMobileOpen ? styles.mobileOpen : ""}`}
    >
      <nav className={styles.navigation} aria-label="监测平台主导航">
        <div className={styles.orbitStage} id="dashboard-orbit-navigation">
          <span className={styles.outerRing} aria-hidden="true" />
          <span className={styles.innerRing} aria-hidden="true" />

          <ul
            ref={orbitListRef}
            className={`${styles.orbitList} ${
              isAutoRotating ? styles.autoRotating : ""
            }`}
            style={orbitStyle}
          >
            {items.map((item, index) => {
              const angle = angleStep * index - 90;
              const isActive = index === activeIndex;
              const Icon = item.icon;
              const nodeStyle = {
                "--node-angle": `${angle}deg`,
                "--node-angle-negative": `${-angle}deg`,
              } as NodeStyle;

              return (
                <li className={styles.orbitItem} style={nodeStyle} key={item.id}>
                  <Link
                    className={`${styles.nodeLink} ${
                      isActive ? styles.activeNode : ""
                    }`}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpenAtPathname(null)}
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

        <div className={styles.desktopHub} aria-hidden="true">
          <Radar size={22} strokeWidth={1.5} />
          <span>NAV / 05</span>
        </div>

        <button
          className={styles.mobileToggle}
          type="button"
          aria-label={isMobileOpen ? "收起轨道导航" : "展开轨道导航"}
          aria-expanded={isMobileOpen}
          aria-controls="dashboard-orbit-navigation"
          onClick={() =>
            setOpenAtPathname((currentPathname) =>
              currentPathname === pathname ? null : pathname,
            )
          }
        >
          {isMobileOpen ? (
            <X size={21} strokeWidth={1.7} aria-hidden="true" />
          ) : (
            <Radar size={21} strokeWidth={1.7} aria-hidden="true" />
          )}
          <span>NAV</span>
        </button>
      </nav>
    </div>
  );
}
