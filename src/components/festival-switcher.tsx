"use client";

import { eventSlots, type EventSlot, type HomepageContent } from "@/lib/homepage-content";
import { EventHighlight } from "./event-highlight";

export function FestivalSwitcher({ content, selected, onSelect }: { content: HomepageContent; selected: EventSlot; onSelect: (slot: EventSlot) => void }) {
  const ordered = [content.defaultEvent, ...eventSlots.filter((slot) => slot !== content.defaultEvent)];
  const visible = ordered.filter((slot) => content[slot].enabled);
  const active = visible.find((slot) => slot === selected) ?? visible[0];
  if (!active) return null;
  return <EventHighlight event={content[active]} controls={visible.length > 1 ? <div className="festival-switches" role="group" aria-label="Choose a featured festival">
    {visible.map((slot) => <button key={slot} type="button" aria-pressed={slot === active} aria-controls="featured-event-content" onClick={() => onSelect(slot)}>{content[slot].name}</button>)}
    <span className="sr-only" role="status">{content[active].name} gifting selected</span>
  </div> : undefined} />;
}
