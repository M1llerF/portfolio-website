"use client";

import { useEffect, useRef } from "react";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

export default function ScrollSplitScene() {
  const sceneRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    if (!scene || !stage) return;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    let raf = 0;

    const tick = () => {
      const r = scene.getBoundingClientRect();
      const sceneHeight = scene.offsetHeight;
      const viewport = window.innerHeight;

      // Progress through this scene while sticky stage is pinned
      const traveled = -r.top;
      const total = sceneHeight - viewport;
      const t = total > 0 ? clamp01(traveled / total) : 0;

      const eased = reduceMotion ? 0 : smoothstep(t);

      // Vertical split distance (top goes up, bottom goes down)
      const maxSplit = window.innerHeight * 0.35;
      const splitPx = eased * maxSplit;

      stage.style.setProperty("--split", `${splitPx.toFixed(2)}px`);
      stage.style.setProperty("--progress", `${t.toFixed(4)}`);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={sceneRef} className="split-scene" aria-label="Split transition">
      <div ref={stageRef} className="split-stage">
        {/* White reveal band that opens from the center as --split grows */}
        <div className="split-reveal" aria-hidden="true" />

        {/* Full-bleed horizontal line halves */}
        <div className="split-line top" aria-hidden="true" />
        <div className="split-line bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
