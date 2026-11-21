import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          background: "#fafafa",
          color: "#18181b",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="12" fill="#047857" />
          <rect x="9" y="11" width="9" height="9" rx="2.5" fill="#ffffff" />
          <rect x="22" y="11" width="9" height="9" rx="2.5" fill="#ffffff" opacity="0.55" />
          <rect x="9" y="24" width="9" height="9" rx="2.5" fill="#ffffff" opacity="0.55" />
          <rect x="22" y="24" width="9" height="9" rx="2.5" fill="#34d399" />
        </svg>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700 }}>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#6b6b74" }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size,
  );
}
