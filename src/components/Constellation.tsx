"use client";

import { useMemo, useState } from "react";

export type ConstellationNode = {
  id: string;
  title: string;
  x?: number;
  y?: number;
  links?: string[];
  size?: "sm" | "md" | "lg";
};

type Props = {
  nodes: ConstellationNode[];
  selectedId?: string | null;
  focusId?: string | null;
  onSelect: (id: string, pos?: { x: number; y: number }, rect?: DOMRect) => void;
  showHint?: boolean;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function splitLineAroundCenterGap(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  r: number
) {
  const dx = bx - ax;
  const dy = by - ay;
  const fx = ax - cx;
  const fy = ay - cy;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;

  const disc = b * b - 4 * a * c;
  if (disc <= 0 || a === 0) {
    return [{ ax, ay, bx, by }];
  }

  const s = Math.sqrt(disc);
  const t1 = (-b - s) / (2 * a);
  const t2 = (-b + s) / (2 * a);
  const lo = Math.min(t1, t2);
  const hi = Math.max(t1, t2);

  if (hi <= 0 || lo >= 1) {
    return [{ ax, ay, bx, by }];
  }

  const tStart = clamp(lo, 0, 1);
  const tEnd = clamp(hi, 0, 1);
  if (tEnd - tStart < 0.02) {
    return [{ ax, ay, bx, by }];
  }

  const p1 = { x: ax + dx * tStart, y: ay + dy * tStart };
  const p2 = { x: ax + dx * tEnd, y: ay + dy * tEnd };

  const segments = [];
  if (tStart > 0) segments.push({ ax, ay, bx: p1.x, by: p1.y });
  if (tEnd < 1) segments.push({ ax: p2.x, ay: p2.y, bx, by });
  return segments;
}

function hash01(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619;
  return ((h >>> 0) % 10_000) / 10_000;
}

export default function Constellation({
  nodes,
  selectedId,
  focusId,
  onSelect,
  showHint = true,
}: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const placed = useMemo(() => {
    const n = Math.max(1, nodes.length);

    return nodes.map((node, i) => {
      const t = (Math.PI * 2 * i) / n - Math.PI / 2;
      const baseX = 0.5 + 0.34 * Math.cos(t);
      const baseY = 0.48 + 0.22 * Math.sin(t);

      const jx = (hash01(node.id + "x") - 0.5) * 0.06;
      const jy = (hash01(node.id + "y") - 0.5) * 0.06;

      const x = node.x ?? clamp(baseX + jx, 0.08, 0.92);
      const y = node.y ?? clamp(baseY + jy, 0.10, 0.90);

      return { ...node, x, y };
    });
  }, [nodes]);

  const idToNode = useMemo(() => {
    const m = new Map<string, (typeof placed)[number]>();
    for (const n of placed) m.set(n.id, n);
    return m;
  }, [placed]);

  const activeId = hoverId ?? selectedId ?? null;
  const hasFocus = !!focusId;
  const focusNode = focusId ? idToNode.get(focusId) : null;
  const focusLinks = useMemo(() => new Set(focusNode?.links ?? []), [focusNode]);

  const edges = useMemo(() => {
    const e: Array<{ a: string; b: string }> = [];
    const hasExplicitLinks = placed.some((n) => (n.links?.length ?? 0) > 0);

    if (hasExplicitLinks) {
      for (const n of placed) {
        for (const b of n.links ?? []) {
          if (idToNode.has(b)) e.push({ a: n.id, b });
        }
      }
    } else {
      for (let i = 0; i < placed.length; i += 1) {
        const a = placed[i];
        const b = placed[(i + 1) % placed.length];
        if (a && b && a.id !== b.id) e.push({ a: a.id, b: b.id });
      }

      if (placed.length > 2) {
        const a = placed[0];
        const c = placed[Math.floor(placed.length / 2)];
        if (a && c && a.id !== c.id) e.push({ a: a.id, b: c.id });
      }
    }

    const seen = new Set<string>();
    const out: typeof e = [];
    for (const { a, b } of e) {
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ a, b });
    }
    return out;
  }, [placed, idToNode]);

  const sizePx = (s?: ConstellationNode["size"]) => {
    if (s === "lg") return 16;
    if (s === "md") return 13;
    return 11;
  };

  const dust = useMemo(() => {
    const count = 80;
    return Array.from({ length: count }, (_, i) => {
      const x = (hash01(`dust-x-${i}`) * 0.9 + 0.05) * 1000;
      const y = (hash01(`dust-y-${i}`) * 0.9 + 0.05) * 1000;
      const r = lerp(0.6, 1.8, hash01(`dust-r-${i}`));
      const o = lerp(0.08, 0.28, hash01(`dust-o-${i}`));
      return { x, y, r, o };
    });
  }, []);

  const centerGap = 110;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "auto" }}>
      {/* Lines */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {dust.map((d, i) => (
          <circle
            key={`dust-${i}`}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={`rgba(233,221,196,${d.o.toFixed(2)})`}
          />
        ))}

        {edges.flatMap(({ a, b }, idx) => {
          const A = idToNode.get(a)!;
          const B = idToNode.get(b)!;

          const ax = (A.x ?? 0.5) * 1000;
          const ay = (A.y ?? 0.5) * 1000;
          const bx = (B.x ?? 0.5) * 1000;
          const by = (B.y ?? 0.5) * 1000;
          const segments = splitLineAroundCenterGap(
            ax,
            ay,
            bx,
            by,
            500,
            500,
            centerGap
          );

          const focusActive =
            focusId &&
            (focusId === a ||
              focusId === b ||
              (idToNode.get(focusId)?.links ?? []).includes(a) ||
              (idToNode.get(focusId)?.links ?? []).includes(b));
          const hoverActive =
            activeId &&
            (activeId === a ||
              activeId === b ||
              (idToNode.get(activeId)?.links ?? []).includes(a) ||
              (idToNode.get(activeId)?.links ?? []).includes(b));
          const isActive = hasFocus ? focusActive : hoverActive;

          const centerA = Math.hypot((A.x ?? 0.5) - 0.5, (A.y ?? 0.5) - 0.5);
          const centerB = Math.hypot((B.x ?? 0.5) - 0.5, (B.y ?? 0.5) - 0.5);
          const centerMin = Math.min(centerA, centerB);
          const fadeT = clamp(centerMin / 0.35, 0, 1);
          const alpha = lerp(0.08, 0.36, fadeT);
          const activeAlpha = lerp(0.16, 0.52, fadeT);
          const focusAlpha = isActive ? 0.38 : 0.12;

          return segments.map((seg, sIdx) => (
            <line
              key={`${idx}-${sIdx}`}
              x1={seg.ax}
              y1={seg.ay}
              x2={seg.bx}
              y2={seg.by}
              stroke={
                hasFocus
                  ? `rgba(233,221,196,${focusAlpha.toFixed(2)})`
                  : isActive
                  ? `rgba(233,221,196,${activeAlpha.toFixed(3)})`
                  : `rgba(233,221,196,${alpha.toFixed(3)})`
              }
              strokeWidth={isActive ? 1.6 : 1}
              strokeDasharray={isActive ? "0" : "6 10"}
              filter={isActive ? "url(#glow)" : undefined}
            />
          ));
        })}
      </svg>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(15,15,15,0.0) 0%, rgba(15,15,15,0.18) 65%, rgba(15,15,15,0.35) 100%)",
          opacity: hasFocus ? 1 : 0,
          transition: "opacity 220ms ease",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Stars */}
      {placed.map((n) => {
        const isSelected = selectedId === n.id;
        const isHover = hoverId === n.id;
        const isActive = isSelected || isHover;
        const isFocusActive = focusId === n.id || focusLinks.has(n.id);
        const dim = hasFocus && !isFocusActive;

        const base = sizePx(n.size);
        const r = isActive ? base * 1.15 : base;
        const starSize = r * 2.0;
        const labelOffset = r + 12;

        return (
          <button
            key={n.id}
            type="button"
            onMouseEnter={() => setHoverId(n.id)}
            onMouseLeave={() => setHoverId(null)}
            onFocus={() => setHoverId(n.id)}
            onBlur={() => setHoverId(null)}
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
              onSelect(n.id, { x: (n.x ?? 0.5) * 100, y: (n.y ?? 0.5) * 100 }, rect);
            }}
            aria-label={`Open project: ${n.title}`}
            style={{
              position: "absolute",
              left: `${(n.x ?? 0.5) * 100}%`,
              top: `${(n.y ?? 0.5) * 100}%`,
              transform: "translate(-50%, -50%)",
              width: r * 4.2,
              height: r * 4.2,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              display: "grid",
              placeItems: "center",
              zIndex: isSelected ? 30 : 20,
              opacity: dim ? 0.35 : 1,
              transition: "opacity 180ms ease",
            }}
          >
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              width={starSize}
              height={starSize}
              style={{
                display: "block",
                transition: "transform 140ms ease, filter 140ms ease",
                transform: isActive ? "scale(1.05)" : "scale(1)",
                filter: isActive
                  ? "drop-shadow(0 0 16px rgba(233,221,196,0.46)) drop-shadow(0 0 40px rgba(233,221,196,0.24))"
                  : "drop-shadow(0 0 12px rgba(233,221,196,0.26)) drop-shadow(0 0 24px rgba(233,221,196,0.12))",
              }}
            >
              <polygon
                points="50,0 62,38 100,50 62,62 50,100 38,62 0,50 38,38"
                fill={isActive ? "rgba(233,221,196,1)" : "rgba(233,221,196,0.82)"}
              />
            </svg>

            {/* Label */}
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, ${labelOffset}px)`,
                whiteSpace: "nowrap",
                padding: "4px 8px",
                borderRadius: 999,
                border: "1px solid rgba(233,221,196,0.22)",
                background: "rgba(15,15,15,0.86)",
                color: "rgba(233,221,196,0.92)",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                pointerEvents: "none",
                transition: "transform 140ms ease",
              }}
            >
              {n.title}
            </span>
          </button>
        );
      })}

      {showHint && (
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 18,
            color: "rgba(233,221,196,0.55)",
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            zIndex: 50,
            userSelect: "none",
          }}
        >
          Click a star to open a project
        </div>
      )}
    </div>
  );
}
