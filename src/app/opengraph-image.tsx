import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name} — ${site.role} portfolio`;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
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
            PORTFOLIO
          </div>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div style={{ fontSize: 96 }}>{site.name}</div>
          <div style={{ fontSize: 44, color: "#ff5a36" }}>{site.role}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            color: "#a1a1aa",
          }}
        >
          <div>{site.location}</div>
          <div>{new URL(site.url).host}</div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
