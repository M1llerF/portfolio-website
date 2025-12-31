"use client";

import { useEffect, useRef } from "react";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

export default function IntroScrollDriver({
  children,
}: {
  children: React.ReactNode;
}) {
  const introRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const intro = introRef.current;
    if (!intro) return;

    let raf = 0;
    const midpoint = 0.5;
    const pupilScale = 140 / 600;
    const burstStartFactor = 0.7;
    const smoothing = 0.35;
    let smoothT = 0;
    const autoDurationMs = 450;
    let autoStartAt: number | null = null;
    let autoStartT = 0;
    let lastTargetT = 0;
    let lastScrollDir: "up" | "down" | "none" = "none";

    const setVar = (name: string, value: string) => {
      document.documentElement.style.setProperty(name, value);
      intro.style.setProperty(name, value);
    };

    const tick = () => {
      const now = performance.now();
      const rect = intro.getBoundingClientRect();
      const viewport = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // progress while intro scrolls off the top
      const raw = -rect.top / viewport;
      const targetT = clamp01(raw);
      const delta = targetT - lastTargetT;
      if (delta > 0.001) {
        lastScrollDir = "down";
      } else if (delta < -0.001) {
        lastScrollDir = "up";
      }
      lastTargetT = targetT;
      if (autoStartAt !== null && lastScrollDir === "up") {
        // Let upward scroll take back control.
        autoStartAt = null;
        smoothT = targetT;
      }
      if (autoStartAt === null) {
        smoothT += (targetT - smoothT) * smoothing;
      } else {
        const autoT =
          autoStartT +
          (1 - autoStartT) *
            smoothstep(clamp01((now - autoStartAt) / autoDurationMs));
        smoothT = autoT;
      }
      const t = smoothT;
      const scrollHintOpacity = clamp01(1 - t * 8);
      // split far enough to fully wipe the screen (downward from midpoint)
      const revealEnd = 0.62;
      const downProgress = clamp01(t / revealEnd);
      const easedDown = smoothstep(downProgress);
      const splitPx = easedDown * viewport * 0.6;
      const irisStart = revealEnd;
      const irisProgress = smoothstep(clamp01((t - irisStart) / (1 - irisStart)));
      const burstStart = 0.78;
      const burstRaw = clamp01((t - burstStart) / (1 - burstStart));
      const baseBurstProgress = Math.pow(burstRaw, 2.4);
      const contentStart = 0.9;
      const baseContentProgress = smoothstep(
        clamp01((t - contentStart) / (1 - contentStart))
      );
      let shouldAuto = false;
      const burstProgress = baseBurstProgress;
      const contentProgress = baseContentProgress;
      let hasEye = false;
      let centerX = 0;
      let centerY = 0;
      let burstStartSize = 0;
      let scaleMax = 1;

      // split far enough to fully wipe the screen
      // find underline Y position
      const stage = intro.querySelector<HTMLElement>(".intro-stage");
      const line = intro.querySelector<HTMLElement>(".intro-lineSplit");

      if (stage && line) {
        const stageRect = stage.getBoundingClientRect();
        const lineRect = line.getBoundingClientRect();
        const lineY =
          lineRect.top - stageRect.top + lineRect.height / 2;

      setVar("--lineY", `${lineY}px`);
      }

      const eye = intro.querySelector<HTMLElement>(".intro-eyeAnchor");
      if (eye) {
        hasEye = true;
        const eyeRect = eye.getBoundingClientRect();
        const fallbackX = eyeRect.left + eyeRect.width / 2;
        const fallbackY = eyeRect.top + eyeRect.height / 2;
        const fallbackSize = eyeRect.width * pupilScale;
        const pupilX = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--pupilX")
        );
        const pupilY = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--pupilY")
        );
        const pupilSizeValue = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--pupilSize")
        );
        centerX = Number.isFinite(pupilX) ? pupilX : fallbackX;
        centerY = Number.isFinite(pupilY) ? pupilY : fallbackY;
        const pupilSize = Number.isFinite(pupilSizeValue)
          ? pupilSizeValue
          : fallbackSize;
        burstStartSize = pupilSize * burstStartFactor;
        const corners = [
          { x: 0, y: 0 },
          { x: viewportWidth, y: 0 },
          { x: 0, y: viewport },
          { x: viewportWidth, y: viewport },
        ];
        let maxDist = 0;
        corners.forEach((corner) => {
          const dx = corner.x - centerX;
          const dy = corner.y - centerY;
          maxDist = Math.max(maxDist, Math.hypot(dx, dy));
        });
        scaleMax =
          burstStartSize > 0 ? Math.max(1, (maxDist * 2) / burstStartSize) : 1;
        const baseBurstScaleValue = 1 + baseBurstProgress * (scaleMax - 1);
        shouldAuto = baseBurstScaleValue >= 1.1;  
      }

      if (autoStartAt === null && shouldAuto && lastScrollDir !== "up") {
        autoStartAt = now;
        autoStartT = t;
      }

      if (hasEye) {
        const burstScaleValue = 1 + burstProgress * (scaleMax - 1);
        const burstScale = burstScaleValue.toFixed(3);
        setVar("--burstX", `${centerX}px`);
        setVar("--burstY", `${centerY}px`);
        setVar("--burstStart", `${burstStartSize.toFixed(2)}px`);
        setVar("--burstScale", burstScale);
      }

      const burstContentProgress = contentProgress;
      const burstContentScale = 0.96 + 0.04 * contentProgress;
      const burstEvents = burstProgress > 0.02 ? "auto" : "none";
      setVar("--split", `${splitPx}px`);
      setVar("--progress", `${t}`);
      setVar("--scrollHintOpacity", `${scrollHintOpacity}`);
      setVar("--iris", `${irisProgress}`);
      setVar("--burstOpacity", `${burstProgress}`);
      setVar("--burstContentOpacity", `${burstContentProgress}`);
      setVar("--burstContentScale", `${burstContentScale}`);
      setVar("--burstEvents", burstEvents);
      intro.dataset.aboutVisible = burstContentProgress > 0.01 ? "true" : "false";

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={introRef} className="intro intro--driven">
      {children}
    </section>
  );
}
