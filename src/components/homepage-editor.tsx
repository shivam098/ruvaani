"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/client-api";
import { eventImages, eventSlots, homepageContentSchema, type EventSlot, type HomepageContent, type HomepageSettings } from "@/lib/homepage-content";

const headingFields = [
  ["eyebrow", "Section label", 60],
  ["title", "Heading", 60],
  ["accent", "Highlighted heading", 40],
] as const;
const linkFields = [
  ["primaryLabel", "Collection button label", 45],
  ["primaryHref", "Collection button link", 300],
  ["secondaryLabel", "Enquiry link label", 45],
  ["secondaryHref", "Enquiry link destination", 300],
  ["note", "Small print", 120],
] as const;

export function HomepageEditor({ initial, demo }: { initial: HomepageSettings; demo: boolean }) {
  const router = useRouter();
  const [content, setContent] = useState(initial.content);
  const [revision, setRevision] = useState(initial.revision);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [eventSlot, setEventSlot] = useState<EventSlot>("event");
  const event = content[eventSlot];
  function eventField<K extends keyof HomepageContent["event"]>(key: K, value: HomepageContent["event"][K]) {
    setContent((previous) => ({ ...previous, [eventSlot]: { ...previous[eventSlot], [key]: value } }));
    setNotice("");
  }
  function marqueeField<K extends keyof HomepageContent["marquee"]>(key: K, value: HomepageContent["marquee"][K]) {
    setContent((previous) => ({ ...previous, marquee: { ...previous.marquee, [key]: value } }));
    setNotice("");
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setNotice("");
    if (demo) { setError("Read-only demo. Configure MongoDB and sign in as an administrator to publish."); return; }
    const parsed = homepageContentSchema.safeParse(content);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setBusy(true);
    try {
      const saved = await apiRequest<HomepageSettings>("/api/admin/homepage", { revision, content: parsed.data }, "PUT");
      setContent(saved.content); setRevision(saved.revision);
      setNotice("Published. The event and marquee are saved together and recorded in the audit log.");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to publish the homepage. Please try again."); }
    finally { setBusy(false); }
  }
  return <form className="homepage-editor" onSubmit={save} aria-label="Homepage event and marquee">
    <h2>The moment in the spotlight.</h2>
    <p className="helper-text">Page order: marquee, logo/navigation, festival switcher, then brand slogans and the collection. Edit either festival and choose which appears first. Hidden festivals are skipped; switching is manual, not timed.</p>
    {demo && <p className="notice">Read-only demo. To publish changes, configure MongoDB, set DEMO_MODE=false and sign in with an administrator account.</p>}
    <fieldset disabled={demo || busy}>
      <legend>Festival selection</legend>
      <div className="form-grid">
        <label>Festival to edit<select value={eventSlot} onChange={(e) => setEventSlot(e.target.value === "event" ? "event" : "additionalEvent")}>{eventSlots.map((slot) => <option key={slot} value={slot}>{content[slot].name} ({slot === "event" ? "original" : "additional"} event)</option>)}</select></label>
        <label>Festival shown first<select value={content.defaultEvent} onChange={(e) => {
          const defaultEvent = e.target.value === "event" ? "event" : "additionalEvent";
          setContent((previous) => ({ ...previous, defaultEvent })); setNotice("");
        }}>{eventSlots.map((slot) => <option key={slot} value={slot}>{content[slot].name}</option>)}</select></label>
      </div>
    </fieldset>
    <fieldset disabled={demo || busy}>
      <legend>Featured event</legend>
      <label className="checkbox-label"><input type="checkbox" checked={event.enabled} onChange={(e) => eventField("enabled", e.target.checked)} />Show featured event</label>
      <div className="form-grid">
        <label>Event name<input required maxLength={50} value={event.name} onChange={(e) => eventField("name", e.target.value)} /></label>
        <label>Event timing<select value={event.status} onChange={(e) => eventField("status", e.target.value === "Current event" ? "Current event" : "Upcoming event")}><option>Upcoming event</option><option>Current event</option></select></label>
        {headingFields.map(([key, label, maximum]) => <label key={key}>{label}<input required maxLength={maximum} value={event[key]} onChange={(e) => eventField(key, e.target.value)} /></label>)}
        <div className="span-two"><label htmlFor="event-description">Description</label><textarea id="event-description" required maxLength={280} rows={3} value={event.description} onChange={(e) => eventField("description", e.target.value)} /></div>
        <label>Banner image<select value={event.image} onChange={(e) => {
          const image = eventImages.find((item) => item.src === e.target.value);
          if (image) setContent((previous) => ({ ...previous, [eventSlot]: { ...previous[eventSlot], image: image.src, imageAlt: image.alt } }));
          setNotice("");
        }}>{eventImages.map((image) => <option value={image.src} key={image.src}>{image.label}</option>)}</select></label>
        <label>Image description<input required maxLength={180} value={event.imageAlt} onChange={(e) => eventField("imageAlt", e.target.value)} /></label>
      </div>
      <div className="event-image-preview"><Image src={event.image} alt={event.imageAlt} fill sizes="(max-width: 760px) 90vw, 600px" /></div>
      <p className="helper-text">Choose from the supplied catalogue photographs. Image descriptions are read by screen readers.</p>
      <div className="form-grid">{linkFields.map(([key, label, maximum]) => <label key={key}>{label}<input required maxLength={maximum} value={event[key]} onChange={(e) => eventField(key, e.target.value)} /></label>)}</div>
      <p className="helper-text">Links must start with / and stay on this site. For a new occasion, use /shop and /corporate?occasion=Celebrations#enquiry, or choose an existing occasion from the enquiry form.</p>
    </fieldset>
    <fieldset disabled={demo || busy}>
      <legend>Top scrolling marquee</legend>
      <label className="checkbox-label"><input type="checkbox" checked={content.marquee.enabled} onChange={(e) => marqueeField("enabled", e.target.checked)} />Show scrolling marquee</label>
      <div className="form-grid">
        <label>Marquee message<input required maxLength={140} value={content.marquee.message} onChange={(e) => marqueeField("message", e.target.value)} /></label>
        <label>Marquee link<input required maxLength={300} value={content.marquee.href} onChange={(e) => marqueeField("href", e.target.value)} /></label>
      </div>
      {content.marquee.additionalMessages.map((message, index) => <div className="marquee-message-row" key={index}>
        <label>Additional message {index + 1}<input required maxLength={140} value={message} onChange={(e) => marqueeField("additionalMessages", content.marquee.additionalMessages.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} /></label>
        <button type="button" className="text-button" aria-label={`Remove additional message ${index + 1}`} onClick={() => marqueeField("additionalMessages", content.marquee.additionalMessages.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
      </div>)}
      <button type="button" className="button button-outline" disabled={content.marquee.additionalMessages.length >= 4} onClick={() => marqueeField("additionalMessages", [...content.marquee.additionalMessages, ""])}>Add another message</button>
      <p className="helper-text">Use up to five messages with one destination. Scrolling starts automatically; visitors can dismiss the strip. Reduced-motion visitors see static messages.</p>
      <details><summary>Marquee link guidance</summary><p className="helper-text">Use /#featured-event to link to the festival switcher. If you hide both festivals, use another destination such as /shop, or hide the marquee too.</p></details>
    </fieldset>
    {error && <p role="alert" className="form-error">{error}</p>}
    {notice && <p role="status" className="notice">{notice}</p>}
    <button className="button button-primary" type="submit" disabled={demo || busy}>{busy ? "Publishing..." : "Publish homepage"}</button>
  </form>;
}
