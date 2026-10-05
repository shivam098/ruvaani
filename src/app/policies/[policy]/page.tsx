import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

const policies: Record<string, { title: string; summary: string[]; sections: [string, string][] }> = {
  privacy: { title: "Your privacy, simply", summary: [
    "Your wishlist saves gift IDs in this browser, not your contact details.",
    "Preview enquiries are not sent or saved. Live enquiries and accounts use the database.",
    "The full business privacy policy and deletion-request process are still pending.",
  ], sections: [
    ["This preview", "The current catalogue stores only wishlist item identifiers in this browser's local storage. Enquiry previews are not submitted or saved by the application. Old browser-local demo bag data, if present from an earlier release, is not reused by the quote-only catalogue."],
    ["When live services are enabled", "Account details, hashed passwords and gifting enquiries are stored in MongoDB. An HttpOnly session cookie is used for authentication. Historical orders and delivery addresses are retained; any existing-order test-payment reconciliation uses Razorpay. The current catalogue does not create new checkout orders or collect card numbers."],
    ["Before launch", "The store owner must publish the legal business identity, privacy contact, retention periods, deletion-request process, service-provider details and applicable consumer disclosures. These details are not yet supplied. No advertising trackers or AI services are included in this MVP."],
  ] },
  terms: { title: "Terms & quotations", summary: [
    "Catalogue prices are references, not final quotes.",
    "Sending an enquiry does not confirm an order.",
    "Branding, taxes and delivery must be agreed before an order is accepted.",
    "There is no online checkout or payment collection.",
  ], sections: [
    ["Catalogue and quotations", "The website presents the supplied RUVAANI catalogue, three signature hamper sheets and two Navratri posters. Displayed package prices are catalogue references; prices marked From are advertised starting prices, not fixed final prices. Neither is a confirmed quotation. Other items are priced on request. There is no direct checkout or online payment collection."],
    ["Enquiries and estimates", "A corporate enquiry records a gifting brief for review. Budget calculations are planning estimates, not approved quotes. Personalization, shipping and tax must be confirmed before a corporate order is accepted."],
    ["Before accepting customers", "The store owner must supply and approve business registration details, contact information, final product descriptions, payment terms, consumer rights, dispute procedures, delivery commitments and refund rules. This page is a launch checklist, not legal advice or finalized legal terms."],
  ] },
  shipping: { title: "Delivery, simply", summary: [
    "Share your delivery locations and preferred date in your enquiry.",
    "Your quote confirms delivery charges, tax and timelines.",
    "A requested date is not a delivery guarantee. Live tracking is not connected.",
  ], sections: [
    ["Delivery planning", "Include your destinations and preferred delivery date in your enquiry. No carrier serviceability or live tracking service is connected."],
    ["Delivery charges", "Shipping, taxes and delivery timelines are confirmed in your quotation. The catalogue does not promise free shipping or apply the previous demo store's sample shipping charges."],
    ["Corporate destinations", "Include delivery locations and your preferred date in a corporate enquiry. Multi-address uploads, shipment tracking and automated logistics belong to later phases. A requested date is not a delivery guarantee."],
  ] },
  returns: { title: "Changes, returns & refunds", summary: [
    "An enquiry is not an order and this website does not collect payments.",
    "Discuss changes to an agreed quote directly with the team.",
    "Final cancellation, returns and refund rules have not yet been supplied.",
  ], sections: [
    ["Quote-only catalogue", "The website does not create new checkout orders or collect payments. A submitted enquiry is not a confirmed order. Discuss changes to an agreed quotation directly with the team."],
    ["Before live payments", "The business must define cancellation windows, damaged-item handling, personalized-gift exceptions, return shipping responsibility and refund timelines. No finalized return policy has been provided."],
    ["Refund operations", "Automated refunds are not implemented in this MVP. Refund reconciliation, cancellation handling and their customer-support procedures must be implemented and tested before enabling live payments. Do not use live Razorpay keys until this release gate is complete."],
  ] },
};
export async function generateMetadata({ params }: { params: Promise<{ policy: string }> }): Promise<Metadata> { const data = policies[(await params).policy]; return { title: data?.title ?? "Not found", robots: { index: false, follow: false } }; }
export default async function PolicyPage({ params }: { params: Promise<{ policy: string }> }) {
  const data = policies[(await params).policy]; if (!data) notFound();
  return <article className="wrap policy-page section"><span className="eyebrow">CLEAR & UPFRONT</span><h1>{data.title}</h1><div className="notice"><p><strong>Policies are not final yet.</strong> This is development-stage information, not final legal terms. Live payments must stay disabled until the business and operational launch checklist is complete.</p></div><section className="policy-summary" aria-label="At a glance"><h2>At a glance</h2><ul>{data.summary.map((point) => <li key={point}>{point}</li>)}</ul></section><h2>Read the details</h2><div className="policy-details">{data.sections.map(([title, body]) => <details key={title}><summary>{title}</summary><p>{body}</p></details>)}</div><Link href="/contact" className="button button-outline">Ask about these policies</Link></article>;
}
