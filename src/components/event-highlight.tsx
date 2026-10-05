import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { HomepageContent } from "@/lib/homepage-content";

export function EventHighlight({ event }: { event: HomepageContent["event"] }) {
  if (!event.enabled) return null;
  return <section id="featured-event" className="festival-highlight wrap" aria-labelledby="event-heading">
    <div className="festival-copy">
      <div className="festival-label"><Sparkles size={17} aria-hidden="true" /><span>{event.eyebrow}</span></div>
      <span className="festival-status">{event.status} &middot; {event.name}</span>
      <h1 id="event-heading">{event.title} <em>{event.accent}</em></h1>
      <p>{event.description}</p>
      <div className="festival-actions">
        <Link href={event.primaryHref} className="button button-light">{event.primaryLabel} <ArrowUpRight size={17} /></Link>
        <Link href={event.secondaryHref} className="text-link">{event.secondaryLabel} <ArrowRight size={17} /></Link>
      </div>
      <span className="festival-note">{event.note}</span>
    </div>
    <div className="festival-image"><Image src={event.image} alt={event.imageAlt} fill preload sizes="(max-width: 760px) 100vw, 45vw" /></div>
  </section>;
}
