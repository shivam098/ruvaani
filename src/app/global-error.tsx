"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body style={{ margin: "10vh auto", padding: 30, maxWidth: 650, background: "#fbf8f2", color: "#51333a", fontFamily: "Georgia, serif" }}><h1>RUVAANI is taking a little pause.</h1><p>We could not connect to the store. Please try again shortly. If you operate this site, check the database configuration and deployment logs.</p><button onClick={reset} style={{ padding: "12px 24px", background: "#613b42", color: "white", border: 0 }}>Try again</button></body></html>;
}
