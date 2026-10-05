import { z } from "zod";
import { catalogueProducts, quoteHref } from "./catalog-data";

export const eventImages = [
  { src: "/catalogue/festive-collection.webp", label: "Festive collection", alt: "Festive hampers, a glowing diya and gold-ribbon gift boxes from the RUVAANI catalogue" },
  ...catalogueProducts.map((product) => ({ src: product.image, label: product.name, alt: product.imageAlt })),
];

const text = (label: string, maximum: number) => z.string().trim().min(1, `${label} is required.`).max(maximum, `${label} must be ${maximum} characters or fewer.`);
const siteLink = text("Link", 300).refine((value) => {
  // Keep destinations on this site, including after URL decoding/normalisation.
  try {
    const decoded = decodeURIComponent(value);
    const unsafeCharacter = Array.from(decoded).some((character) => character === "\\" || character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
    return value.startsWith("/") && !/\s/.test(value) && !unsafeCharacter
      && !decoded.startsWith("//") && new URL(value, "https://ruvaani.example").origin === "https://ruvaani.example";
  } catch { return false; }
}, "Use a link within this website, starting with a single /.");

export const homepageContentSchema = z.object({
  event: z.object({
    enabled: z.boolean(),
    name: text("Event name", 50),
    status: z.enum(["Current event", "Upcoming event"]),
    eyebrow: text("Section label", 60),
    title: text("Heading", 60),
    accent: text("Highlighted heading", 40),
    description: text("Description", 280),
    image: z.string().refine((value) => eventImages.some((image) => image.src === value), "Choose an available catalogue photograph."),
    imageAlt: text("Image description", 180),
    primaryLabel: text("Collection button label", 45),
    primaryHref: siteLink,
    secondaryLabel: text("Enquiry link label", 45),
    secondaryHref: siteLink,
    note: text("Small print", 120),
  }).strict(),
  marquee: z.object({
    enabled: z.boolean(),
    message: text("Marquee message", 140),
    href: siteLink,
  }).strict(),
}).strict().superRefine((content, context) => {
  if (!content.event.enabled && content.marquee.enabled && siteLink.safeParse(content.marquee.href).success) {
    const destination = new URL(content.marquee.href, "https://ruvaani.example");
    if (destination.pathname === "/" && destination.hash === "#featured-event") {
      context.addIssue({ code: "custom", path: ["marquee", "href"], message: "The featured event is hidden. Change the marquee link or hide the marquee too." });
    }
  }
});

export const homepageUpdateSchema = z.object({
  revision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER - 1),
  content: homepageContentSchema,
}).strict();

export type HomepageContent = z.infer<typeof homepageContentSchema>;
export interface HomepageSettings { revision: number; content: HomepageContent }

export const defaultHomepageContent: HomepageContent = {
  event: {
    enabled: true,
    name: "Diwali",
    status: "Upcoming event",
    eyebrow: "THE DIWALI EDIT",
    title: "Light up their",
    accent: "Diwali.",
    description: "Thoughtful hampers, festive keepsakes and personal details for the people who make your year brighter.",
    image: eventImages[0].src,
    imageAlt: eventImages[0].alt,
    primaryLabel: "Explore festive gifts",
    primaryHref: "/shop?category=Divine%20%26%20festive%20gifts",
    secondaryLabel: "Plan your Diwali gifting",
    secondaryHref: quoteHref({ occasion: "Diwali" }),
    note: "From 10 gifts. Made personal, together.",
  },
  marquee: { enabled: true, message: "The Diwali edit is here", href: "/#featured-event" },
};
