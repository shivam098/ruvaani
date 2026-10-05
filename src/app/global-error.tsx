"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body style={{ margin: "10vh auto", padding: 30, maxWidth: 650, background: "#fbf6ec", color: "#203c32", fontFamily: "Georgia, serif" }}><h1>RUVAANI is taking a little pause.</h1><p>We could not load this page. Please try again shortly. If you operate this site, check the deployment logs.</p><button onClick={reset} style={{ padding: "12px 24px", background: "#064c3c", color: "white", border: 0 }}>Try again</button></body></html>;
}
