import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { getProject } from "@/lib/projects";

export const alt = "Case study preview";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0b",
            color: "#f4f4f5",
            fontSize: 72,
          }}
        >
          {site.name}
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 88,
          backgroundColor: "#0a0a0b",
          color: "#f4f4f5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 10,
              backgroundColor: "#ff5a36",
              borderRadius: 6,
            }}
          />
          <div style={{ fontSize: 26, color: "#a1a1aa", letterSpacing: "5px" }}>
            CASE STUDY
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            width: 1024,
          }}
        >
          <div style={{ fontSize: 76 }}>{project.title}</div>
          <div style={{ fontSize: 30, color: "#a1a1aa" }}>
            {project.summary}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {project.tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 24,
                color: "#f4f4f5",
                border: "1px solid #3f3f46",
                borderRadius: 999,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 22,
                paddingRight: 22,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
