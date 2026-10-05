import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
export const alt = "RUVAANI - Gifts that create lasting moments";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OpenGraphImage() {
  const icon = await readFile(join(process.cwd(), "src", "app", "icon.png"));
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#fbf6ec", color: "#064c3c", border: "18px solid #e2d6c1" }}>
    {/* ImageResponse renders its own HTML rather than a browser document. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={`data:image/png;base64,${icon.toString("base64")}`} alt="" width={126} height={126} />
    <div style={{ display: "flex", fontSize: 25, letterSpacing: 12, marginTop: 15 }}>RUVAANI</div><div style={{ display: "flex", fontSize: 64, fontFamily: "serif", marginTop: 33 }}>Gifts that create lasting moments.</div><div style={{ display: "flex", fontSize: 23, marginTop: 30, color: "#80602d" }}>Thoughtfully crafted. Beautifully gifted.</div>
  </div>, size);
}
