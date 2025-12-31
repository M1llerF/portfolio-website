"use client";

import { useEffect, useMemo, useRef } from "react";

type Props = {
  fromRect: DOMRect;
  insetPx?: number;            // border width (paper inset)
  durationMs?: number;
  onMorphDone: () => void;      // reveal content pop-in
  onFadeDone: () => void;       // unmount overlay
  respectReducedMotion?: boolean;
  reverse?: boolean;
};

type Pt = { x: number; y: number };

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}

function easeOutExpo(t: number) {
  // snappy but smooth
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeInExpo(t: number) {
  return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPt(a: Pt, b: Pt, t: number): Pt {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Sample N points evenly along a closed polyline (vertices)
function sampleClosedPolyline(vertices: Pt[], n: number): Pt[] {
  if (vertices.length < 2) return Array.from({ length: n }, () => ({ x: 0, y: 0 }));

  const pts = vertices.slice();
  // Ensure closed
  if (pts[0].x !== pts[pts.length - 1].x || pts[0].y !== pts[pts.length - 1].y) {
    pts.push({ ...pts[0] });
  }

  const segLen: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = dist(pts[i], pts[i + 1]);
    segLen.push(d);
    total += d;
  }
  if (total === 0) return Array.from({ length: n }, () => ({ ...pts[0] }));

  const out: Pt[] = [];
  let segIdx = 0;
  let segPos = 0;

  for (let k = 0; k < n; k++) {
    const target = (total * k) / n;

    while (segIdx < segLen.length && segPos + segLen[segIdx] < target) {
      segPos += segLen[segIdx];
      segIdx++;
    }
    const i = Math.min(segIdx, pts.length - 2);
    const d = segLen[Math.min(i, segLen.length - 1)] || 1;
    const localT = clamp01((target - segPos) / d);
    const a = pts[i];
    const b = pts[i + 1];
    out.push({ x: lerp(a.x, b.x, localT), y: lerp(a.y, b.y, localT) });
  }
  return out;
}

// Rect perimeter vertices (closed polyline) in order
function rectVertices(r: { left: number; top: number; width: number; height: number }): Pt[] {
  const x0 = r.left;
  const y0 = r.top;
  const x1 = r.left + r.width;
  const y1 = r.top + r.height;
  return [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
}

// Your star points in normalized [0..1] space (same as your SVG polygon)
const STAR_NORM: Pt[] = [
  { x: 0.5, y: 0.0 },
  { x: 0.62, y: 0.38 },
  { x: 1.0, y: 0.5 },
  { x: 0.62, y: 0.62 },
  { x: 0.5, y: 1.0 },
  { x: 0.38, y: 0.62 },
  { x: 0.0, y: 0.5 },
  { x: 0.38, y: 0.38 },
];

function starVerticesInRect(r: DOMRect): Pt[] {
  return STAR_NORM.map((p) => ({
    x: r.left + p.x * r.width,
    y: r.top + p.y * r.height,
  }));
}

function pointsToPath(points: Pt[]) {
  if (!points.length) return "";
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
  }
  d += " Z";
  return d;
}

export default function StarMorphOverlay({
  fromRect,
  insetPx = 16,
  durationMs = 820,
  onMorphDone,
  onFadeDone,
  respectReducedMotion = true,
  reverse = false,
}: Props) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const morphDoneRef = useRef(onMorphDone);
  const fadeDoneRef = useRef(onFadeDone);

  const reduce = useMemo(() => (respectReducedMotion ? prefersReducedMotion() : false), [respectReducedMotion]);

  useEffect(() => {
    morphDoneRef.current = onMorphDone;
  }, [onMorphDone]);

  useEffect(() => {
    fadeDoneRef.current = onFadeDone;
  }, [onFadeDone]);

  useEffect(() => {
    const path = pathRef.current;
    const root = rootRef.current;
    if (!path || !root) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Target is the “paper” inset area (inside your 16px border)
    const target = {
      left: insetPx,
      top: insetPx,
      width: Math.max(1, vw - insetPx * 2),
      height: Math.max(1, vh - insetPx * 2),
    };

    // Sample lots of points so the morph feels smooth
    const N = 128;

    const startVerts = reverse ? rectVertices(target) : starVerticesInRect(fromRect);
    const endVerts = reverse ? starVerticesInRect(fromRect) : rectVertices(target);

    const startPts = sampleClosedPolyline(startVerts, N);
    const endPts = sampleClosedPolyline(endVerts, N);

    // Reduced motion: do a short fade instead of a big morph
    const morphMs = reduce ? 140 : durationMs;
    const fadeMs = reduce ? 140 : 220;

    let raf = 0;
    const t0 = performance.now();

    root.style.opacity = "1";

    const tick = () => {
      const now = performance.now();
      const t = clamp01((now - t0) / morphMs);
      const k = reduce ? t : easeInExpo(t);

      const pts = startPts.map((p, i) => lerpPt(p, endPts[i], k));
      path.setAttribute("d", pointsToPath(pts));

      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // Morph done — reveal content pop-in under it
      morphDoneRef.current();

      // Fade overlay out
      root.style.transition = `opacity ${fadeMs}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      root.style.opacity = "0";

      window.setTimeout(() => fadeDoneRef.current(), fadeMs);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [fromRect, insetPx, durationMs, reduce, reverse]);

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        pointerEvents: "none",
        opacity: 1,
      }}
    >
      <svg width="100%" height="100%" style={{ display: "block" }}>
        <path ref={pathRef} fill="rgba(233,221,196,1)" />
      </svg>
    </div>
  );
}
