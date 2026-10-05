import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

const policies: Record<string, { title: string; sections: [string, string][] }> = {
  privacy: { title: "A note on your privacy", sections: [
    ["This preview", "The current catalogue stores only wishlist item identifiers in this browser's local storage. Enquiry previews are not submitted or saved by the application. Old browser-local demo bag data, if present from an earlier release, is not reused by the quote-only catalogue."],
    ["When live services are enabled", "Account details, hashed passwords and gifting enquiries are stored in MongoDB. An HttpOnly session cookie is used for authentication. Historical orders and delivery addresses are retained; any existing-order test-payment reconciliation uses Razorpay. The current catalogue does not create new checkout orders or collect card numbers."],
    ["Before launch", "The store owner must publish the legal business identity, privacy contact, retention periods, deletion-request process, service-provider details and applicable consumer disclosures. These details are not yet supplied. No advertising trackers or AI services are included in this MVP."],
  ] },
  terms: { title: "The thoughtful terms", sections: [
    ["Catalogue and quotations", "The website presents the supplied RUVAANI catalogue and three hamper sheets. Displayed package prices are catalogue references, not a confirmed quotation. Other items are priced on request. There is no direct checkout or online payment collection."],
    ["Enquiries and estimates", "A corporate enquiry records a gifting brief for review. Budget calculations are planning estimates, not approved quotes. Personalization, shipping and tax must be confirmed before a corporate order is accepted."],
    ["Before accepting customers", "The store owner must supply and approve business registration details, contact information, final product descriptions, payment terms, consumer rights, dispute procedures, delivery commitments and refund rules. This page is a launch checklist, not legal advice or finalized legal terms."],
  ] },
  shipping: { title: "A note on happy doorsteps", sections: [
    ["Delivery planning", "Include your destinations and preferred delivery date in your enquiry. No carrier serviceability or live tracking service is connected."],
    ["Delivery charges", "Shipping, taxes and delivery timelines are confirmed in your quotation. The catalogue does not promise free shipping or apply the previous demo store's sample shipping charges."],
    ["Corporate destinations", "Include delivery locations and your preferred date in a corporate enquiry. Multi-address uploads, shipment tracking and automated logistics belong to later phases. A requested date is not a delivery guarantee."],
  ] },
  returns: { title: "Returns, refunds & little changes", sections: [
    ["Quote-only catalogue", "The website does not create new checkout orders or collect payments. A submitted enquiry is not a confirmed order. Discuss changes to an agreed quotation directly with the team."],
    ["Before live payments", "The business must define cancellation windows, damaged-item handling, personalized-gift exceptions, return shipping responsibility and refund timelines. No finalized return policy has been provided."],
    ["Refund operations", "Automated refunds are not implemented in this MVP. Refund reconciliation, cancellation handling and their customer-support procedures must be implemented and tested before enabling live payments. Do not use live Razorpay keys until this release gate is complete."],
  ] },
};
export async function generateMetadata({ params }: { params: Promise<{ policy: string }> }): Promise<Metadata> { const data = policies[(await params).policy]; return { title: data?.title ?? "Not found", robots: { index: false, follow: false } }; }
export default async function PolicyPage({ params }: { params: Promise<{ policy: string }> }) {
  const data = policies[(await params).policy]; if (!data) notFound();
  return <article className="wrap policy-page section"><span className="eyebrow">CLEAR, CONSIDERED & UPFRONT</span><h1>{data.title}</h1><div className="notice"><p><strong>Development-stage information.</strong> Final business policies are not yet published. This site must not accept live payments until the business and operational launch checklist is complete.</p></div>{data.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}<Link href="/contact" className="text-link">Get in touch</Link></article>;
}
