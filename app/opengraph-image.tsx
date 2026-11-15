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
          background: "#f6f3ee",
          color: "#1d2623",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="12" fill="#2f6b57" />
          <path
            d="M9 24c3-9 9-13 11-13s8 4 11 13"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="20" cy="29" r="3" fill="#e08a6c" />
        </svg>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700 }}>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#5d6965" }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size,
  );
}
