"use client";

type Props = {
  title: string;
  description: string;
  imageSrc?: string;
  tags?: string[];
  scale?: number;
};

export default function ProjectCard({
  title,
  description,
  imageSrc,
  tags = [],
  scale = 1,
}: Props) {
  const EYE = "#e9ddc4";

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top right",
        borderRadius: 18,
        border: "1px solid rgba(233,221,196,0.18)",
        background: "rgba(15,15,15,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        overflow: "hidden",
      }}
    >
      {imageSrc ? (
        <div style={{ width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
          <img
            src={imageSrc}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              filter: "saturate(0.9) contrast(1.05)",
            }}
          />
        </div>
      ) : null}

      <div style={{ padding: 14 }}>
        <div
          style={{
            color: "rgba(233,221,196,0.92)",
            fontSize: 22,
            letterSpacing: "0.02em",
            lineHeight: 1.15,
            marginBottom: 10,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "rgba(233,221,196,0.72)",
            fontSize: 13.5,
            lineHeight: 1.55,
            marginBottom: tags.length ? 14 : 0,
          }}
        >
          {description}
        </div>

        {tags.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(233,221,196,0.20)",
                  background: "rgba(15,15,15,0.55)",
                  color: "rgba(233,221,196,0.80)",
                  padding: "6px 10px",
                  fontSize: 11,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
