import { ImageResponse } from "next/og";
export const alt = "RUVAANI — Thoughtful gifts. Lasting moments.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f6f0e6", color: "#613b42" }}><div style={{ display: "flex", fontSize: 28, letterSpacing: 14 }}>RUVAANI</div><div style={{ display: "flex", fontSize: 82, fontFamily: "serif", marginTop: 48 }}>Some gifts say so much more.</div><div style={{ display: "flex", fontSize: 25, marginTop: 30, color: "#776963" }}>Thoughtfully chosen. Beautifully given.</div></div>, size);
}
