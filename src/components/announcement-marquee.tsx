"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Pause, Play, Sparkles } from "lucide-react";
import type { HomepageContent } from "@/lib/homepage-content";

const motionQuery = "(prefers-reduced-motion: reduce)";
const prefersReducedMotion = () => window.matchMedia(motionQuery).matches;
const serverMotionPreference = () => false;
function subscribeToMotionPreference(notify: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

export function AnnouncementMarquee({ announcement }: { announcement: HomepageContent["marquee"] }) {
  const [choice, setChoice] = useState<"auto" | "play" | "pause">("auto");
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, serverMotionPreference);
  const playing = choice === "play" || (choice === "auto" && !reducedMotion);
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
  }, [announcement.enabled, announcement.message, announcement.additionalMessages]);
  if (!announcement.enabled) return null;
  return <section className="announcement" aria-label="Announcements" data-paused={!playing} data-motion={choice}>
    <Link href={announcement.href} className="announcement-link" aria-label={messages.join(". ")}>
      <span ref={track} id="announcement-track" className="announcement-track" aria-hidden="true">
        {[0, 1].map((copy) => <span className="announcement-group" key={copy}>
          {repeatedMessages.map((message, index) => <span className="announcement-item" key={index}><Sparkles size={14} />{message}<ArrowUpRight size={14} /></span>)}
        </span>)}
      </span>
      <span className="announcement-static" aria-hidden="true">{messages.map((message, index) => <span key={index}><Sparkles size={14} /><span>{message}</span></span>)}</span>
    </Link>
    <button type="button" className="announcement-pause" aria-controls="announcement-track" aria-label={playing ? "Pause announcement" : "Play announcement"} title={playing ? "Pause scrolling" : "Start scrolling"} onClick={() => setChoice(playing ? "pause" : "play")}>{playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}</button>
  </section>;
}
