"use client";
import { useCallback } from "react";
import IntroScrollDriver from "./IntroScrollDriver";
import AboutSection from "@/components/AboutSection";
import SandboxScene from "./sandbox/SandboxScene";

export default function IntroSandboxController() {
  const handleAboutClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const target = document.getElementById("about");
      if (!target) return;

      const startY = window.scrollY;
      const targetY = startY + target.getBoundingClientRect().top;
      const distance = targetY - startY;
      const durationMs = 1500;
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / durationMs);
        const eased = t * t * (3 - 2 * t);
        window.scrollTo(0, startY + distance * eased);
        if (t < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    },
    []
  );

  return (
    <IntroScrollDriver>
      <div className="intro-stage">
        {/* Sandbox reveal band */}
        <div className="intro-sandbox" aria-hidden="true">
          <div className="intro-sandboxInner">
            <SandboxScene />
          </div>
        </div>

        <div className="intro-eyeBurst">
          <div className="intro-eyeBurstBg" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="intro-copy">
          <div className="intro-text intro-text-top">
            <h1 id="intro-title" className="intro-title">
              Hey, I&apos;m Miller Fourie
            </h1>
          </div>

          {/* Splitting underline */}
          <div className="intro-lineSplit" aria-hidden="true">
            <div className="intro-lineHalf top" />
            <div className="intro-lineHalf bottom" />
          </div>

          <div className="intro-text intro-text-bottom">
            <p className="intro-subtitle">
              I build things
            </p>
            <a className="intro-link" href="#about" onClick={handleAboutClick}>
              &lt;MORE ABOUT ME&gt;
            </a>
          </div>
        </div>

        <div className="intro-scrollCue" aria-hidden="true">
          <span className="intro-scrollCueArrow" />
          <span className="intro-scrollCueLabel">Scroll</span>
          <span className="intro-scrollCueArrow" />
        </div>
      </div>
      <div className="intro-about">
        <AboutSection />
      </div>
    </IntroScrollDriver>
  );
}
