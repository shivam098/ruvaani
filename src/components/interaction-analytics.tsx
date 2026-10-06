"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { interactionSchema } from "@/lib/interaction-data";

function privacyPreference() {
  return navigator.doNotTrack === "1" || ("globalPrivacyControl" in navigator && navigator.globalPrivacyControl === true);
}
function record(event: string, target: string) {
  if (privacyPreference()) return;
  const parsed = interactionSchema.safeParse({ event, target });
  if (!parsed.success) { console.warn("RUVAANI analytics: ignored an unknown interaction."); return; }
  void fetch("/api/analytics", {
    method: "POST", headers: { "Content-Type": "application/json" },
    credentials: "omit", referrerPolicy: "no-referrer", keepalive: true,
    body: JSON.stringify(parsed.data),
  }).then((response) => {
    if (!response.ok) console.warn("RUVAANI analytics: interaction was not recorded.", response.status);
  }).catch(() => { console.warn("RUVAANI analytics: network request failed."); });
}

export function InteractionAnalytics({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled || lastPath.current === pathname) return;
    lastPath.current = pathname;
    const match = /^\/catalogue(?:\/([^/]+))?$/.exec(pathname);
    if (match && interactionSchema.safeParse({ event: "catalogue_view", target: match[1] ?? "hub" }).success) record("catalogue_view", match[1] ?? "hub");
  }, [enabled, pathname]);
  useEffect(() => {
    if (!enabled) return;
    function click(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>("[data-track-event]");
      if (element) { record(element.dataset.trackEvent ?? "", element.dataset.trackTarget ?? ""); return; }
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (anchor && anchor.origin === window.location.origin && anchor.pathname === "/corporate") record("enquiry_start", "other");
    }
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, [enabled]);
  return null;
}
