"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play, Sparkles } from "lucide-react";
import type { HomepageContent } from "@/lib/homepage-content";

export function AnnouncementMarquee({ announcement }: { announcement: HomepageContent["marquee"] }) {
  const [paused, setPaused] = useState(false);
  const track = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const resize = () => {
      if (element.scrollWidth > 0) element.style.animationDuration = `${element.scrollWidth / 2 / 40}s`;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [announcement.enabled, announcement.message]);
  if (!announcement.enabled) return null;
  return <section className="announcement" aria-label="Announcements" data-paused={paused}>
    <Link href={announcement.href} className="announcement-link" aria-label={announcement.message}>
      <span ref={track} id="announcement-track" className="announcement-track" aria-hidden="true">
        {[0, 1].map((copy) => <span className="announcement-group" key={copy}>
          {[0, 1, 2].map((item) => <span className="announcement-item" key={item}><Sparkles size={14} />{announcement.message}<ArrowUpRight size={14} /></span>)}
        </span>)}
      </span>
      <span className="announcement-static" aria-hidden="true"><Sparkles size={14} />{announcement.message}<ArrowUpRight size={14} /></span>
    </Link>
    <button type="button" className="announcement-pause" aria-controls="announcement-track" aria-label={paused ? "Resume announcement" : "Pause announcement"} onClick={() => setPaused(!paused)}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>
  </section>;
}
