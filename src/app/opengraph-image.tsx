import { ImageResponse } from "next/og";

export const alt = "LG TWINS Fan Site";
export const size = { width: 1200, height: 630 };
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
          justifyContent: "center",
          padding: 80,
          background: "#16161a",
          color: "#f5f5f7",
          fontSize: 140,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        <div>WE ARE</div>
        <div style={{ color: "#c30452" }}>TWINS.</div>
        <div style={{ fontSize: 32, marginTop: 32, color: "#a1a1aa" }}>
          Unofficial LG Twins fan site
        </div>
      </div>
    ),
    size,
  );
}
