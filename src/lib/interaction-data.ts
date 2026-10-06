import { z } from "zod";
import { catalogueEditions, giftCategories, giftFestivals, giftOccasions } from "./discovery";

export const interactionEvents = ["category_click", "occasion_click", "festival_click", "catalogue_view", "catalogue_download", "enquiry_start"] as const;
const targets: Record<typeof interactionEvents[number], readonly string[]> = {
  category_click: giftCategories.map((item) => item.slug),
  occasion_click: giftOccasions.map((item) => item.slug),
  festival_click: giftFestivals.map((item) => item.slug),
  catalogue_view: ["hub", ...catalogueEditions.map((item) => item.slug)],
  catalogue_download: catalogueEditions.map((item) => item.slug),
  enquiry_start: ["header", "mobile", "collection", "catalogue", "other"],
};
export const interactionSchema = z.object({
  event: z.enum(interactionEvents),
  target: z.string().min(1).max(40),
}).strict().refine((value) => targets[value.event].includes(value.target), { message: "Unknown interaction target." });
export type Interaction = z.infer<typeof interactionSchema>;
export interface AnalyticsSummary {
  enabled: boolean;
  interactions: (Interaction & { count: number })[];
  submittedEnquiries: number;
}
