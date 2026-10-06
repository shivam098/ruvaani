"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen } from "lucide-react";

export function MobileEnquiry() {
  const path = usePathname();
  if (["/corporate", "/admin", "/account"].some((route) => path.startsWith(route)) || path.startsWith("/catalogue/print/")) return null;
  return <nav className="mobile-conversion" aria-label="Quick gifting actions"><Link href="/catalogue"><BookOpen size={18} />Catalogue</Link><Link href="/corporate#enquiry" data-track-event="enquiry_start" data-track-target="mobile">Let&apos;s curate your gifting <ArrowUpRight size={18} /></Link></nav>;
}
