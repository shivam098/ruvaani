"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles, X } from "lucide-react";
import type { HomepageContent } from "@/lib/homepage-content";

export function AnnouncementMarquee({ announcement }: { announcement: HomepageContent["marquee"] }) {
  const [dismissed, setDismissed] = useState(false);
  const messages = [announcement.message, ...announcement.additionalMessages];
  const repeatedMessages = Array.from({ length: Math.max(3, messages.length) }, (_, index) => messages[index % messages.length]);
  const track = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const resize = () => {
      if (element.scrollWidth > 0) element.style.setProperty("--marquee-duration", `${element.scrollWidth / 2 / 40}s`);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [announcement.enabled, announcement.message, announcement.additionalMessages, dismissed]);
  if (!announcement.enabled || dismissed) return null;
  return <section className="announcement" aria-label="Announcements">
    <Link href={announcement.href} className="announcement-link" aria-label={messages.join(". ")}>
      <span ref={track} id="announcement-track" className="announcement-track" aria-hidden="true">
        {[0, 1].map((copy) => <span className="announcement-group" key={copy}>
          {repeatedMessages.map((message, index) => <span className="announcement-item" key={index}><Sparkles size={14} />{message}<ArrowUpRight size={14} /></span>)}
        </span>)}
      </span>
      <span className="announcement-static" aria-hidden="true">{messages.map((message, index) => <span key={index}><Sparkles size={14} /><span>{message}</span></span>)}</span>
    </Link>
    <button type="button" className="announcement-dismiss" aria-label="Dismiss announcements" title="Dismiss announcements" onClick={() => {
      setDismissed(true);
      document.querySelector<HTMLAnchorElement>(".site-header .brand-logo")?.focus({ preventScroll: true });
    }}><X size={18} aria-hidden="true" /></button>
  </section>;
}
