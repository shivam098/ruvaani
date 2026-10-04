import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export const metadata: Metadata = { title: "A few thoughtful answers" };
const faqs = [
  ["Can I place an order in demo mode?", "No. The demo lets you explore gifts, save a wishlist, personalize gifts, and preview checkout. It does not create accounts, send enquiries, take payments or place real orders. Use sample details only."],
  ["Can I make a gift personal?", "Gifts marked Personalizable can include a name or short message. The demo adds ₹99 per gift when either is included, and shows a message-card preview. Brand artwork and company-logo uploads will be added in a later phase."],
  ["Do you support corporate gifting?", "You can share a brief with your company details, occasion, quantity, budget and delivery locations. When live services are enabled, your brief is saved for admin review. An enquiry is not a confirmed quotation or order."],
  ["Is there a minimum quantity for a corporate enquiry?", "The enquiry form starts at 10 gifts. Individual catalogue gifts can be added one at a time. Larger requirements can be described in your gifting brief."],
  ["How does the gift finder work?", "It matches your recipient, occasion and budget against the current catalogue, and only recommends gifts with available stock. It is a guided finder, not an AI service. It does not invent products, prices or availability."],
  ["What are the delivery charges?", "The sample pricing is ₹99 for shipping, complimentary from ₹1,999. Catalogue prices include tax. These commercial terms must be confirmed by the business before the store accepts live orders."],
  ["Can I deliver to multiple addresses?", "This checkout supports one Indian address per order. Mention multiple destinations in a corporate enquiry. Recipient CSV uploads and automated multi-address fulfilment are later-phase features."],
  ["Which payment methods are supported?", "The live checkout is designed to use Razorpay's hosted payment window. Actual methods depend on your merchant account settings. Payments stay disabled in demo mode and are only confirmed after server-side verification of a captured payment."],
  ["What if payment confirmation is delayed?", "Check My orders before paying again. A successful payment screen alone does not confirm an order: the server verifies payment capture, amount and order reference. The Razorpay webhook also handles delayed confirmation."],
  ["Are the product photographs and contents final?", "No. This launch preview uses original product illustrations and licensed editorial photography. Product contents, stock, prices, packaging, delivery commitments and return terms are illustrative until the business approves them."],
];
export default function FaqPage() { return <section className="wrap faq-page section"><div className="page-heading centered"><span className="eyebrow">THE LITTLE THINGS YOU MIGHT BE WONDERING</span><h1>A few thoughtful <em>answers.</em></h1></div><div className="faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div><div className="faq-footer"><h2>Something else on your mind?</h2><Link href="/contact" className="text-link">Let&apos;s talk <ArrowRight size={17} /></Link></div></section>; }
