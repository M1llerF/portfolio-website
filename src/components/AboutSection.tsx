"use client";

import { useEffect, useRef } from "react";
import styles from "./AboutSection.module.css";

export default function AboutSection({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const targets = Array.from(
      frame.querySelectorAll<HTMLElement>(`.${styles.scrollReveal}`)
    );

    if (targets.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      targets.forEach((target) => target.setAttribute("data-visible", "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.3) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: [0, 0.3] }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className={`${styles.about} ${className ?? ""}`}>
      <div className={styles.section}>
        <div ref={frameRef} className={styles.textFrame}>
          {/* Star above the About Me headline */}
          <div
            className={`${styles.titleStar} ${styles.scrollReveal}`}
            aria-hidden="true"
            data-scroll-reveal
          >
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <polygon points="50,0 62,38 100,50 62,62 50,100 38,62 0,50 38,38" />
            </svg>
          </div>

          <h1
            className={`${styles.headline} ${styles.scrollReveal}`}
            data-scroll-reveal
          >
            About Me
          </h1>

          <p
            className={`${styles.lead} ${styles.scrollReveal}`}
            data-scroll-reveal
          >
            I learn by building and iterating early, using hands-on work to turn
            ambiguity into systems I can understand. I focus on correct,
            maintainable solutions and make tradeoffs intentionally.
          </p>

          {/* Ring frame wraps the grid */}
          <div className={styles.ringFrame}>
            {/* Rings behind content */}
            <svg
              className={styles.ringSvg}
              viewBox="0 0 1200 520"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* outer ring */}
              <ellipse cx="600" cy="260" rx="560" ry="210" />
              {/* inner ring */}
              <ellipse cx="600" cy="260" rx="490" ry="180" />
              {/* a faint offset ring for lofi imperfection */}
              <ellipse cx="615" cy="250" rx="545" ry="205" />
            </svg>

            <div className={styles.grid}>
              <div
                className={`${styles.block} ${styles.scrollReveal}`}
                data-reveal
                data-scroll-reveal
              >
                <h3 className={styles.blockTitle}>Technical Background</h3>
                <ul className={styles.list}>
                  <li>Primary: Python, C++</li>
                  <li>Additional experience: Java, Racket, Unity</li>
                </ul>
              </div>

              <div
                className={`${styles.block} ${styles.scrollReveal}`}
                data-reveal
                data-scroll-reveal
              >
                <h3 className={styles.blockTitle}>Design Philosophy</h3>
                <p className={styles.copy}>
                  When I&apos;m implementing code, I consistently ask myself three
                  questions:
                </p>
                <ul className={styles.list}>
                  <li>
                    Does this change require understanding more of the system
                    than it should?
                  </li>
                  <li>Is any necessary complexity explicit and localized?</li>
                  <li>Does this design rely on implicit knowledge to make sense?</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /ringFrame */}
        </div>
      </div>
    </section>
  );
}
