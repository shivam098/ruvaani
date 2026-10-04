"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="empty-state wrap"><span className="eyebrow">A LITTLE PAUSE</span><h1>Something didn&apos;t go as planned.</h1><p>We couldn&apos;t load this page. Please try again. No payment has been confirmed by this screen.</p><button className="button button-primary" onClick={reset}>Try again</button></section>;
}
