import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { HomepageContent } from "@/lib/homepage-content";

export function EventHighlight({ event }: { event: HomepageContent["event"] }) {
  if (!event.enabled) return null;
  return <section id="featured-event" className="festival-highlight" aria-labelledby="event-heading">
    {["left", "right"].map((side) => <svg key={side} className={`festival-flourish festival-flourish-${side}`} viewBox="0 0 160 300" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M35 300C125 210 12 102 123 5M68 247C9 239 1 209 9 186C57 190 77 210 68 247ZM80 212C130 203 157 176 150 149C108 154 80 175 80 212ZM76 168C25 154 8 120 23 99C62 110 78 131 76 168ZM92 117C132 111 151 88 145 64C108 71 94 88 92 117ZM106 66C68 55 58 29 69 11C100 22 109 41 106 66Z" />
      <circle cx="35" cy="273" r="5" /><circle cx="124" cy="136" r="4" /><circle cx="55" cy="79" r="3" />
    </svg>)}
    <div className="festival-inner">
    <div className="festival-copy">
      <div className="festival-label"><Sparkles size={17} aria-hidden="true" /><span>{event.eyebrow}</span></div>
      <span className="festival-status">{event.status} &middot; {event.name}</span>
      <h1 id="event-heading">{event.title} <em>{event.accent}</em></h1>
      <div className="festival-actions">
        <Link href={event.primaryHref} className="button festival-button">{event.primaryLabel} <ArrowUpRight size={17} /></Link>
        <Link href={event.secondaryHref} className="text-link">{event.secondaryLabel} <ArrowRight size={17} /></Link>
      </div>
      <details className="festival-details"><summary>View event details</summary><p>{event.description}</p><p className="festival-note">{event.note}</p></details>
    </div>
    <div className="festival-image"><Image src={event.image} alt={event.imageAlt} fill preload sizes="(max-width: 760px) 92vw, (min-width: 1800px) 820px, 48vw" /></div>
    </div>
  </section>;
}
