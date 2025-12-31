"use client";

import { useEffect, useMemo, useState } from "react";
import EyeSandbox from "@/components/EyeSandbox";
import Constellation, { type ConstellationNode } from "@/components/Constellation";
import ProjectPanel from "@/components/ProjectPanel";
import StarMorphOverlay from "@/components/StarMorphOverlay";
import { projects } from "@/components/projects";

export default function SandboxScene() {
  const BG = "#0f0f0f";

  const projectList = projects;

  const nodes: ConstellationNode[] = useMemo(
    () =>
      projectList.map((project, index) => {
        const layout: Record<string, { x: number; y: number; size?: ConstellationNode["size"] }> = {
          "rl-maze-explorer": { x: 0.18, y: 0.34, size: "lg" },
          "priority-queue-comparison": { x: 0.82, y: 0.22, size: "md" },
          "racket-interpreter": { x: 0.66, y: 0.82, size: "md" },
          "repo-mods": { x: 0.30, y: 0.68, size: "sm" },
        };

        const preset = layout[project.id];
        return {
          id: project.id,
          title: project.title,
          x: preset?.x,
          y: preset?.y,
          size: preset?.size ?? (index === 0 ? "lg" : "md"),
          links: [],
        };
      }),
    [projectList]
  );

  const [selectedId, setSelectedId] = useState<string | null>(projectList[0]?.id ?? null);
  const [openId, setOpenId] = useState<string | null>(null);

  const [transition, setTransition] = useState<{ id: string; rect: DOMRect } | null>(null);
  const [closeTransition, setCloseTransition] = useState<{ rect: DOMRect } | null>(null);
  const [lastRect, setLastRect] = useState<DOMRect | null>(null);

  const openProject = projectList.find((p) => p.id === openId) ?? null;
  const inProjectMode = !!openId || !!transition;
  const closing = !!closeTransition;
  const hideEye = inProjectMode || closing;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--eyeVisible",
      hideEye ? "0" : "1"
    );
    return () => {
      document.documentElement.style.removeProperty("--eyeVisible");
    };
  }, [hideEye]);

  const handleSelect = (id: string, _pos?: { x: number; y: number }, rect?: DOMRect) => {
    setSelectedId(id);
    if (openId === id) return;

    if (!rect) {
      setOpenId(id);
      return;
    }

    setLastRect(rect);
    setTransition({ id, rect });
  };

  const handleClose = () => {
    if (!lastRect) {
      setOpenId(null);
      return;
    }
    setOpenId(null);
    setCloseTransition({ rect: lastRect });
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        background: BG,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Constellation */}
      <div
        style={{
          opacity: inProjectMode ? 0 : 1,
          transition: "opacity 220ms ease",
          pointerEvents: inProjectMode || closing ? "none" : "auto",
        }}
      >
        <Constellation nodes={nodes} selectedId={selectedId} focusId={null} onSelect={handleSelect} />
      </div>

      {/* Center eye */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "clamp(240px, 34vw, 560px)",
          aspectRatio: "2 / 1",
          zIndex: 45,
          pointerEvents: "none",
          opacity: inProjectMode ? 0 : 1,
          transition: "opacity 220ms ease",
        }}
        className="intro-eyeAnchor"
      >
        <EyeSandbox />
      </div>

      {/* The morph overlay */}
      {transition && (
        <StarMorphOverlay
          fromRect={transition.rect}
          onMorphDone={() => setOpenId(transition.id)}
          onFadeDone={() => setTransition(null)}
        />
      )}

      {closeTransition && (
        <StarMorphOverlay
          fromRect={closeTransition.rect}
          reverse
          onMorphDone={() => setOpenId(null)}
          onFadeDone={() => setCloseTransition(null)}
        />
      )}

      {/* Full page project */}
      <ProjectPanel project={openProject} onClose={handleClose} variant="fullscreen" />
    </section>
  );
}
