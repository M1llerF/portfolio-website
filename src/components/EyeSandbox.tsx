"use client";

import { type CSSProperties, useEffect, useId, useRef } from "react";

function clampToEllipse(dx: number, dy: number, rx: number, ry: number) {
  const nx = dx / rx;
  const ny = dy / ry;
  const k = nx * nx + ny * ny;
  if (k <= 1) return { dx, dy };
  const s = 1 / Math.sqrt(k);
  return { dx: dx * s, dy: dy * s };
}

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Curved eyelid shapes (filled with BG), clipped to the eye shape.
function topLidPathD(yEdge: number, curve: number) {
  return `
    M 0 0
    H 600
    V ${yEdge}
    C 450 ${yEdge - curve}, 150 ${yEdge - curve}, 0 ${yEdge}
    Z
  `;
}

function bottomLidPathD(yEdge: number, curve: number) {
  return `
    M 0 300
    H 600
    V ${yEdge}
    C 450 ${yEdge + curve}, 150 ${yEdge + curve}, 0 ${yEdge}
    Z
  `;
}

type EyeSandboxProps = {
  className?: string;
  style?: CSSProperties;
};

export default function EyeSandbox({ className, style }: EyeSandboxProps) {
  const BG = "#0f0f0f";
  const EYE = "#e9ddc4";
  const PUPIL = BG;

  const clipId = useId();

  const svgRef = useRef<SVGSVGElement | null>(null);

  const pupilRef = useRef<SVGEllipseElement | null>(null);
  const topLidRef = useRef<SVGPathElement | null>(null);
  const bottomLidRef = useRef<SVGPathElement | null>(null);

  const eyeCenter = { x: 300, y: 150 };
  const baseR = 70;

  // Allowed pupil-center movement (viewBox coords)
  const track = { rx: 60, ry: 20 };

  const eyePathD = `
    M 150 150
    C 190 35, 410 35, 450 150
    C 410 265, 190 265, 150 150
    Z
  `;

  useEffect(() => {
    const svg = svgRef.current;
    const pupil = pupilRef.current;
    const topLid = topLidRef.current;
    const bottomLid = bottomLidRef.current;
    if (!svg || !pupil || !topLid || !bottomLid) return;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    // -------------------------
    // TUNING
    // -------------------------
    // Movement
    const followEase = 0.10;

    // Blink
    const blinkEveryMinMs = 3500;
    const blinkEveryMaxMs = 9000;
    const blinkMinOpen = 0.05;
    const blinkDownMs = 65;
    const blinkUpMs = 95;
    const lidEase = 0.14;

    // Curved lids feel
    const lidOpenOvershoot = 95;
    const lidClosedMeetY = eyeCenter.y;
    const curveOpen = 85;
    const curveClosed = 18;

    // Micro-saccades
    const saccadeAmp = 6; // viewBox units
    const saccadeDurationMs = 65;
    const stillnessThreshold = 0.55;
    const stillForMs = 650;
    const saccadeCooldownMs = 900;

    // Squash/stretch
    const speedNorm = 6.0;
    const squashAmt = 0.09;
    const stretchAmt = 0.05;
    // -------------------------

    let pointerX = 0;
    let pointerY = 0;
    let hasPointer = false;

    // Current pupil center
    let cx = eyeCenter.x;
    let cy = eyeCenter.y;

    // Used for squash/stretch
    let lastX = cx;
    let lastY = cy;

    // eyelid openness (1=open, 0=closed)
    let open = 1;
    let openTarget = 1;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // Blink scheduler
    let nextBlinkAt = performance.now() + rand(blinkEveryMinMs, blinkEveryMaxMs);
    let blinkPhase: "none" | "down" | "up" = "none";
    let blinkStartAt = 0;

    // Saccade scheduler
    let lastMoveAt = performance.now();
    let lastSaccadeAt = 0;
    let saccadeEndAt = 0;
    let saccadeDx = 0;
    let saccadeDy = 0;

    const onMove = (e: PointerEvent) => {
      hasPointer = true;
      pointerX = e.clientX;
      pointerY = e.clientY;
    };

    window.addEventListener("pointermove", onMove);

    function screenToSvgPoint(): DOMPoint | null {
      if (!hasPointer || !svg) return null;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      return new DOMPoint(pointerX, pointerY).matrixTransform(ctm.inverse());
    }

    let raf = 0;

    const tick = () => {
      const now = performance.now();

      if (reduceMotion) {
        pupil.setAttribute("cx", String(eyeCenter.x));
        pupil.setAttribute("cy", String(eyeCenter.y));
        pupil.setAttribute("rx", String(baseR));
        pupil.setAttribute("ry", String(baseR));

        // Lids fully open
        topLid.setAttribute("d", topLidPathD(-lidOpenOvershoot, curveOpen));
        bottomLid.setAttribute(
          "d",
          bottomLidPathD(300 + lidOpenOvershoot, curveOpen)
        );

        raf = requestAnimationFrame(tick);
        return;
      }

      // -------------------------
      // 1) Compute target (follow cursor)
      // -------------------------
      let targetX = eyeCenter.x;
      let targetY = eyeCenter.y;

      const p = screenToSvgPoint();
      if (p) {
        let dx = p.x - eyeCenter.x;
        let dy = p.y - eyeCenter.y;
        ({ dx, dy } = clampToEllipse(dx, dy, track.rx, track.ry));
        targetX = eyeCenter.x + dx;
        targetY = eyeCenter.y + dy;
      }

      // -------------------------
      // 2) Blink lids (curved)
      // -------------------------
      openTarget = 1;

      if (blinkPhase === "none" && now >= nextBlinkAt) {
        blinkPhase = "down";
        blinkStartAt = now;
      }

      if (blinkPhase === "down") {
        const k = clamp((now - blinkStartAt) / blinkDownMs, 0, 1);
        openTarget = Math.min(openTarget, lerp(1, blinkMinOpen, k));
        if (k >= 1) {
          blinkPhase = "up";
          blinkStartAt = now;
        }
      } else if (blinkPhase === "up") {
        const k = clamp((now - blinkStartAt) / blinkUpMs, 0, 1);
        openTarget = Math.min(openTarget, lerp(blinkMinOpen, 1, k));
        if (k >= 1) {
          blinkPhase = "none";
          nextBlinkAt = now + rand(blinkEveryMinMs, blinkEveryMaxMs);
        }
      }

      open += (openTarget - open) * lidEase;

      const lidAmount = 1 - open;
      const yTopEdge = lerp(-lidOpenOvershoot, lidClosedMeetY, lidAmount);
      const yBotEdge = lerp(300 + lidOpenOvershoot, lidClosedMeetY, lidAmount);
      const curve = lerp(curveOpen, curveClosed, lidAmount);

      topLid.setAttribute("d", topLidPathD(yTopEdge, curve));
      bottomLid.setAttribute("d", bottomLidPathD(yBotEdge, curve));

      // -------------------------
      // 3) Micro-saccades (tiny, occasional, when settled)
      // -------------------------
      const followError = Math.hypot(targetX - cx, targetY - cy);

      if (followError < stillnessThreshold) {
        if (now - lastMoveAt > stillForMs) {
          const canSaccade = now - lastSaccadeAt > saccadeCooldownMs && open > 0.55;
          if (canSaccade) {
            const a = Math.random() * Math.PI * 2;
            const m = rand(saccadeAmp * 0.55, saccadeAmp);
            saccadeDx = Math.cos(a) * m;
            saccadeDy = Math.sin(a) * (m * 0.6);
            saccadeEndAt = now + saccadeDurationMs;
            lastSaccadeAt = now;
          }
        }
      } else {
        lastMoveAt = now;
      }

      let sdx = 0;
      let sdy = 0;
      if (now < saccadeEndAt) {
        const k = 1 - (saccadeEndAt - now) / saccadeDurationMs;
        const pulse = Math.sin(k * Math.PI);
        sdx = saccadeDx * pulse;
        sdy = saccadeDy * pulse;
      }

      // Apply saccade, re-clamp
      let ddx = targetX + sdx - eyeCenter.x;
      let ddy = targetY + sdy - eyeCenter.y;
      ({ dx: ddx, dy: ddy } = clampToEllipse(ddx, ddy, track.rx, track.ry));
      const finalTx = eyeCenter.x + ddx;
      const finalTy = eyeCenter.y + ddy;

      // -------------------------
      // 4) Follow + squash/stretch
      // -------------------------
      cx += (finalTx - cx) * followEase;
      cy += (finalTy - cy) * followEase;

      const vx = cx - lastX;
      const vy = cy - lastY;
      const speed = Math.hypot(vx, vy);
      lastX = cx;
      lastY = cy;

      const t = clamp(speed / speedNorm, 0, 1);
      const squash = 1 - squashAmt * t;
      const stretch = 1 + stretchAmt * t;
      const iris = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--iris")
      );
      const irisScale = Number.isFinite(iris) ? 1 + iris * 0.45 : 1;

      pupil.setAttribute("cx", cx.toFixed(2));
      pupil.setAttribute("cy", cy.toFixed(2));
      pupil.setAttribute("rx", (baseR * stretch * irisScale).toFixed(2));
      pupil.setAttribute("ry", (baseR * squash * irisScale).toFixed(2));

      const ctm = svg.getScreenCTM();
      if (ctm) {
        const center = new DOMPoint(cx, cy).matrixTransform(ctm);
        const edge = new DOMPoint(
          cx + baseR * stretch * irisScale,
          cy
        ).matrixTransform(ctm);
        const radiusPx = Math.hypot(edge.x - center.x, edge.y - center.y);
        document.documentElement.style.setProperty("--pupilX", `${center.x}px`);
        document.documentElement.style.setProperty("--pupilY", `${center.y}px`);
        document.documentElement.style.setProperty("--pupilSize", `${radiusPx * 2}px`);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [clipId]);

  return (
    <div className={className} style={style}>
      <svg
        ref={svgRef}
        viewBox="0 0 600 300"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }}
        role="img"
        aria-label="Abstract eye that follows the cursor"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={eyePathD} />
          </clipPath>
        </defs>

        {/* Eye body */}
        <path d={eyePathD} fill={EYE} />
        {/* Inside the eye (clipped): pupil + lids */}
        <g clipPath={`url(#${clipId})`}>
          <ellipse ref={pupilRef} cx="300" cy="150" rx="70" ry="70" fill={PUPIL} />

          {/* Curved blink lids */}
          <path
            ref={topLidRef}
            d="M0 0H600V-95C450 -180 150 -180 0 -95Z"
            fill={BG}
          />
          <path
            ref={bottomLidRef}
            d="M0 300H600V395C450 480 150 480 0 395Z"
            fill={BG}
          />
        </g>
      </svg>
    </div>
  );
}
