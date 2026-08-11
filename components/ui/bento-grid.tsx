"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import classes from "./bento-grid.module.css";

export type BentoTone = "neutral" | "amber" | "cyan" | "green";
export type BentoSpan = 4 | 6 | 12;

export interface BentoItem {
  id: string;
  title: string;
  description?: string;
  icon: ReactNode;
  status?: string;
  tags?: string[];
  meta?: string;
  colSpan?: BentoSpan;
  tone?: BentoTone;
  headerAction?: ReactNode;
  content?: ReactNode;
  hasPersistentHover?: boolean;
}

interface BentoGridProps {
  items: readonly BentoItem[];
  disabled?: boolean;
  onItemSelect?: (itemId: string) => void;
  transitioningItemId?: string | null;
}

function BentoGrid({
  items,
  disabled = false,
  onItemSelect,
  transitioningItemId,
}: BentoGridProps) {
  const isTransitioning = transitioningItemId != null;

  return (
    <div className={classes.grid}>
      {items.map((item) => (
        <article
          className={`${classes.card} ${
            item.hasPersistentHover ? classes.persistentHover : ""
          }`}
          data-span={item.colSpan ?? 4}
          data-tone={item.tone ?? "neutral"}
          data-interactive={onItemSelect ? "true" : undefined}
          data-transitioning={transitioningItemId === item.id ? "true" : undefined}
          aria-labelledby={`bento-title-${item.id}`}
          key={item.id}
        >
          <span className={classes.texture} aria-hidden="true" />
          {onItemSelect ? (
            <span className={classes.selectionMask} aria-hidden="true" />
          ) : null}

          <div className={classes.cardContent}>
            <header className={classes.cardHeader}>
              <span className={classes.icon} aria-hidden="true">
                {item.icon}
              </span>

              <div className={classes.heading}>
                <h2 id={`bento-title-${item.id}`}>
                  {item.title}
                  {item.meta ? <small>{item.meta}</small> : null}
                </h2>
                {item.description ? <p>{item.description}</p> : null}
              </div>

              {item.headerAction ? (
                <div className={classes.headerAction}>{item.headerAction}</div>
              ) : item.status ? (
                <span className={classes.status}>{item.status}</span>
              ) : null}
            </header>

            {item.content ? (
              <div className={classes.customContent}>{item.content}</div>
            ) : null}

            {item.tags?.length ? (
              <footer className={classes.tags}>
                {item.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </footer>
            ) : null}
          </div>

          {onItemSelect ? (
            <button
              className={classes.cardTrigger}
              type="button"
              aria-label={`打开${item.title}详情`}
              disabled={disabled || isTransitioning}
              onClick={() => onItemSelect(item.id)}
            >
              <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export { BentoGrid };
