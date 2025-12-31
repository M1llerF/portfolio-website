"use client";

import { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";

export type ProjectPanelData = {
  id: string;
  title: string;
  description: string;
  imageSrc?: string;
  hero?: ProjectMedia;
  showcase?: ProjectShowcaseItem[];
  paper?: ProjectPaper;
  tags?: string[];
  links?: Array<{ label: string; href: string }>;
};

export type ProjectMedia = {
  type: "image" | "video";
  src: string;
  alt?: string;
  speed?: number;
  poster?: string;
};

export type ProjectShowcaseItem = {
  media?: ProjectMedia;
  gallery?: ProjectMedia[];
  title: string;
  description: string;
};

export type ProjectPaper = {
  title: string;
  description: string;
  src: string;
};

type Props = {
  project: ProjectPanelData | null;
  onClose: () => void;
  variant?: "panel" | "fullscreen";
  /**
   * Fullscreen only:
   * - false: keep the "frame" (paper + border) visible, but hide/pop-in the content
   * - true: show content normally
   */
  showContent?: boolean;
};

export default function ProjectPanel({
  project,
  onClose,
  variant = "panel",
  showContent = true,
}: Props) {
  const EYE = "#e9ddc4";
  const PUPIL = "#0d0d0d";

  const [present, setPresent] = useState(!!project);
  const [displayProject, setDisplayProject] = useState(project);
  const [galleryIndex, setGalleryIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    if (project) {
      setPresent(true);
      setDisplayProject(project);
    }
  }, [project]);

  if (!present) return null;

  const open = !!project;
  const panelProject = displayProject ?? project;

  if (variant === "fullscreen") {
    if (!project) return null;

    const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
    const popEase = "cubic-bezier(0.2, 1.25, 0.2, 1)";

    const show = showContent;
    const heroMedia: ProjectMedia | null = project.hero
      ? project.hero
      : project.imageSrc
      ? { type: "image", src: project.imageSrc, alt: "" }
      : null;

    const renderMedia = (media: ProjectMedia, maxHeight?: string) => {
      const mediaStyle = {
        maxWidth: "100%",
        maxHeight: maxHeight ?? "100%",
        width: "auto",
        height: "auto",
        display: "block",
        margin: "0 auto",
      } as const;

      if (media.type === "video") {
        return (
          <video
            src={media.src}
            muted
            loop
            autoPlay
            playsInline
            poster={media.poster}
            onLoadedMetadata={(event) => {
              event.currentTarget.playbackRate = media.speed ?? 1;
            }}
            style={mediaStyle}
          />
        );
      }

      return (
        <img
          src={media.src}
          alt={media.alt ?? ""}
          style={mediaStyle}
        />
      );
    };

    return (
      <section
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: EYE,
          color: PUPIL,
          border: `16px solid ${PUPIL}`,
          padding: 0,
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: EYE,
            color: PUPIL,
            boxShadow: `inset 0 -2px 0 0 ${PUPIL}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 6,
            paddingBottom: 12,
            paddingInline: "clamp(24px, 4vw, 56px)",
            gap: 12,
          }}
        >
          <div
            className="project-kicker"
            style={{
              color: "rgba(13,13,13,0.7)",
            }}
          >
            Project
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {(project.links?.length ?? 0) > 0 &&
              project.links!.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${PUPIL}`,
                    background: "transparent",
                    color: PUPIL,
                    padding: "8px 12px",
                    textDecoration: "none",
                    fontSize: 11,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  {l.label}
                </a>
              ))}
            <button
              type="button"
              onClick={onClose}
              style={{
                borderRadius: 999,
                border: `1px solid ${PUPIL}`,
                background: "transparent",
                color: PUPIL,
                padding: "8px 12px",
                cursor: "pointer",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontSize: 11,
              }}
            >
              Close
            </button>
          </div>
        </div>
        {/* Pop-in container (content only) */}
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0px) scale(1)" : "translateY(10px) scale(0.985)",
            transition: `opacity 220ms ${ease}, transform 320ms ${popEase}`,
            willChange: "opacity, transform",
            pointerEvents: show ? "auto" : "none",
            overflow: "visible",
          }}
        >
          <div
            style={{
              padding: "clamp(24px, 4vw, 56px)",
              paddingTop: "clamp(18px, 3vw, 40px)",
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
            }}
          >
            <div style={{ maxWidth: 920, width: "100%", margin: "0 auto", flex: 1, minHeight: 0 }}>
              <h1
                className={`${show ? "bubble-in bubble-1" : ""} project-title`}
                style={{ transformOrigin: "50% 100%" }}
              >
                {project.title}
              </h1>
              <div className="project-line" aria-hidden="true" />

              <div
                className={show ? "bubble-in bubble-2" : ""}
                style={{
                  width: "100%",
                  borderRadius: 18,
                  background: "transparent",
                  overflow: "hidden",
                  marginBottom: 20,
                  display: "block",
                  color: EYE,
                  fontStyle: "italic",
                  transformOrigin: "50% 100%",
                }}
              >
                {heroMedia ? renderMedia(heroMedia, "min(58vh, 520px)") : "Image"}
              </div>

              <p
                className={`${show ? "bubble-in bubble-3" : ""} project-description`}
                style={{ transformOrigin: "50% 100%" }}
              >
                {project.description}
              </p>

              {(project.showcase?.length ?? 0) > 0 && (
                <div
                  className={show ? "bubble-in bubble-4" : ""}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 22,
                    marginBottom: 22,
                    transformOrigin: "50% 100%",
                  }}
                >
                  {project.showcase!.map((item, index) => (
                    <div key={`${project.id}-showcase-${index}`} style={{ display: "flex", flexDirection: "column" }}>
                      {item.gallery?.length ? (
                        (() => {
                          const galleryKey = `${project.id}-gallery-${index}`;
                          const activeIndex = Math.min(
                            item.gallery!.length - 1,
                            galleryIndex[galleryKey] ?? 0
                          );
                          const activeMedia = item.gallery![activeIndex];

                          return (
                            <div
                              style={{
                                width: "100%",
                                borderRadius: 16,
                                overflow: "hidden",
                                background: "transparent",
                                marginBottom: 12,
                                display: "block",
                                position: "relative",
                              }}
                            >
                              {renderMedia(activeMedia, "min(46vh, 420px)")}
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: 10,
                                  pointerEvents: "none",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGalleryIndex((prev) => ({
                                      ...prev,
                                      [galleryKey]:
                                        (activeIndex - 1 + item.gallery!.length) % item.gallery!.length,
                                    }))
                                  }
                                  style={{
                                    pointerEvents: "auto",
                                    borderRadius: 999,
                                    border: `1px solid ${EYE}`,
                                    background: "rgba(13,13,13,0.65)",
                                    color: EYE,
                                    width: 34,
                                    height: 34,
                                    display: "grid",
                                    placeItems: "center",
                                    cursor: "pointer",
                                  }}
                                  aria-label="Previous image"
                                >
                                  {"<"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGalleryIndex((prev) => ({
                                      ...prev,
                                      [galleryKey]: (activeIndex + 1) % item.gallery!.length,
                                    }))
                                  }
                                  style={{
                                    pointerEvents: "auto",
                                    borderRadius: 999,
                                    border: `1px solid ${EYE}`,
                                    background: "rgba(13,13,13,0.65)",
                                    color: EYE,
                                    width: 34,
                                    height: 34,
                                    display: "grid",
                                    placeItems: "center",
                                    cursor: "pointer",
                                  }}
                                  aria-label="Next image"
                                >
                                  {">"}
                                </button>
                              </div>
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 10,
                                  right: 12,
                                  padding: "4px 8px",
                                  borderRadius: 999,
                                  border: `1px solid rgba(233,221,196,0.4)`,
                                  background: "rgba(13,13,13,0.6)",
                                  color: EYE,
                                  fontSize: 11,
                                  letterSpacing: "0.12em",
                                }}
                              >
                                {activeIndex + 1} / {item.gallery!.length}
                              </div>
                            </div>
                          );
                        })()
                      ) : item.media ? (
                      <div
                        style={{
                          width: "100%",
                          borderRadius: 16,
                          overflow: "hidden",
                          background: "transparent",
                          marginBottom: 12,
                          display: "block",
                        }}
                      >
                        {renderMedia(item.media, "min(46vh, 420px)")}
                      </div>
                      ) : null}
                      <div className="project-section-title">
                        {item.title}
                      </div>
                      <p
                        className="project-section-text"
                      >
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {project.paper && (
                <div
                  className={show ? "bubble-in bubble-5" : ""}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 22,
                    transformOrigin: "50% 100%",
                  }}
                >
                  <div className="project-section-title">
                    {project.paper.title}
                  </div>
                  <p className="project-section-text" style={{ margin: 0 }}>
                    {project.paper.description}
                  </p>
                  <div className="project-section-kicker">
                    Read the Paper
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "min(70vh, 720px)",
                      borderRadius: 16,
                      overflow: "hidden",
                      background: "transparent",
                    }}
                  >
                    <iframe
                      title={project.paper.title}
                      src={project.paper.src}
                      style={{ width: "100%", height: "100%", border: "none" }}
                    />
                  </div>
                </div>
              )}

              {(project.tags?.length ?? 0) > 0 && (
                <div
                  className={show ? "bubble-in bubble-6" : ""}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 18,
                    transformOrigin: "50% 100%",
                  }}
                >
                  {project.tags!.map((t) => (
                    <span
                      key={t}
                      style={{
                        border: `1px solid ${PUPIL}`,
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {(project.links?.length ?? 0) > 0 && (
                <div
                  className={show ? "bubble-in bubble-7" : ""}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    transformOrigin: "50% 100%",
                  }}
                >
                  {project.links!.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        border: `1px solid ${PUPIL}`,
                        borderRadius: 999,
                        padding: "8px 12px",
                        color: PUPIL,
                        textDecoration: "none",
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <style jsx>{`
          .bubble-in {
            animation-name: bubble-rise;
            animation-duration: 620ms;
            animation-timing-function: cubic-bezier(0.22, 1.2, 0.22, 1);
            animation-fill-mode: both;
            will-change: transform, opacity, filter;
          }
          .bubble-1 {
            animation-delay: 0ms;
          }
          .bubble-2 {
            animation-delay: 60ms;
          }
          .bubble-3 {
            animation-delay: 110ms;
          }
          .bubble-4 {
            animation-delay: 160ms;
          }
          .bubble-5 {
            animation-delay: 210ms;
          }
          .bubble-6 {
            animation-delay: 260ms;
          }
          .bubble-7 {
            animation-delay: 310ms;
          }
          .project-kicker {
            font-size: 12px;
            letter-spacing: 0.32em;
            text-transform: uppercase;
          }
          .project-title {
            margin: 6px 0 10px;
            font-size: clamp(2rem, 5vw, 3.2rem);
            font-weight: 600;
            letter-spacing: 0.01em;
          }
          .project-line {
            height: 2px;
            width: 100%;
            background: rgba(13, 13, 13, 0.8);
            margin: 6px 0 18px;
          }
          .project-description {
            font-size: 1.05rem;
            line-height: 1.7;
            margin-bottom: 20px;
            color: rgba(13, 13, 13, 0.78);
          }
          .project-section-title {
            font-size: 0.78rem;
            letter-spacing: 0.26em;
            text-transform: uppercase;
            margin-top: 4px;
          }
          .project-section-text {
            margin-top: 8px;
            font-size: 1rem;
            line-height: 1.7;
            white-space: pre-line;
          }
          .project-section-kicker {
            font-size: 0.7rem;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: rgba(13, 13, 13, 0.7);
          }
          @keyframes bubble-rise {
            0% {
              opacity: 0;
              transform: translateY(22px) scale(0.9);
              filter: blur(3px);
            }
            55% {
              opacity: 1;
              transform: translateY(-6px) scale(1.04);
              filter: blur(0px);
            }
            78% {
              transform: translateY(2px) scale(0.99);
            }
            100% {
              opacity: 1;
              transform: translateY(0px) scale(1);
              filter: blur(0px);
            }
          }
        `}</style>
      </section>
    );
  }

  // --- PANEL VARIANT (unchanged) ---
  return (
    <aside
      style={{
        position: "absolute",
        right: 18,
        top: 18,
        bottom: 18,
        width: "clamp(300px, 28vw, 420px)",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "auto",
        opacity: open ? 1 : 0,
        transform: open ? "translateX(0) scale(1)" : "translateX(12px) scale(0.98)",
        transition:
          "opacity 260ms cubic-bezier(0.16, 1, 0.3, 1), transform 260ms cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 260ms cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "opacity, transform",
        backdropFilter: open ? "blur(10px)" : "blur(0px)",
        WebkitBackdropFilter: open ? "blur(10px)" : "blur(0px)",
      }}
      onTransitionEnd={(e) => {
        if (!project && e.propertyName === "opacity") setPresent(false);
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            color: "rgba(233,221,196,0.65)",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          Project
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            borderRadius: 999,
            border: "1px solid rgba(233,221,196,0.22)",
            background: "rgba(15,15,15,0.75)",
            color: "rgba(233,221,196,0.85)",
            padding: "8px 10px",
            cursor: "pointer",
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            fontSize: 11,
          }}
        >
          Close
        </button>
      </div>

      <ProjectCard
        title={panelProject?.title ?? ""}
        description={panelProject?.description ?? ""}
        imageSrc={panelProject?.imageSrc ?? ""}
        tags={panelProject?.tags ?? []}
        scale={1}
      />

      {(panelProject?.links?.length ?? 0) > 0 && (
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(233,221,196,0.18)",
            background: "rgba(15,15,15,0.72)",
            padding: 12,
          }}
        >
          <div
            style={{
              color: "rgba(233,221,196,0.55)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Links
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {panelProject!.links!.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(233,221,196,0.22)",
                  background: "rgba(15,15,15,0.65)",
                  color: "rgba(233,221,196,0.86)",
                  padding: "8px 10px",
                  textDecoration: "none",
                  fontSize: 11,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div
        style={{
          color: "rgba(233,221,196,0.35)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          userSelect: "none",
        }}
      >
        Tip: hover stars to preview titles
      </div>
    </aside>
  );
}


