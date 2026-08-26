"use client";

import { useLayoutEffect, useRef, useState } from "react";

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

export function useResponsiveCanvas(
  mobileCanvasWidth: number,
  layoutKey: string,
) {
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const viewport = canvasViewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;

    const updateCanvas = () => {
      const isMobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
      const nextScale = isMobile
        ? Math.min(1, viewport.clientWidth / mobileCanvasWidth)
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
  }, [layoutKey, mobileCanvasWidth]);

  return {
    canvasHeight,
    canvasRef,
    canvasScale,
    canvasViewportRef,
  };
}
