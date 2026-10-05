import { z } from "zod";
import { catalogueProducts, MINIMUM_QUOTE_BUDGET, occasions, recipients } from "./catalog-data";

export const quotePrefillSchema = z.object({
  product: z.string().refine((id) => catalogueProducts.some((product) => product.id === id), "That catalogue selection is no longer available.").optional(),
  quantity: z.coerce.number().int().min(10).max(100000).optional(),
  budget: z.coerce.number().int().min(MINIMUM_QUOTE_BUDGET).max(1000000).optional(),
  occasion: z.string().refine((value) => occasions.includes(value)).optional(),
  recipient: z.string().refine((value) => recipients.includes(value)).optional(),
});
export type QuotePrefill = z.infer<typeof quotePrefillSchema>;

export const cartLineSchema = z.object({
  productId: z.string().regex(/^rv-\d{3}$/),
  quantity: z.number().int().min(1).max(1000),
  name: z.string().trim().max(40).default(""),
  message: z.string().trim().max(180).default(""),
}).strict();

export const addressSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  line1: z.string().trim().min(8).max(250),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid six-digit pincode."),
}).strict();

export const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1).max(30),
  address: addressSchema,
  idempotencyKey: z.uuid(),
}).strict();

export const loginSchema = z.object({
  email: z.email().max(254).transform((v) => v.toLowerCase()),
  password: z.string().min(12).max(128),
}).strict();

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2).max(80),
});

export const quoteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().min(2).max(150),
  email: z.email().max(254),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  occasion: z.string().trim().min(2).max(60),
  quantity: z.number().int().min(10).max(100000),
  budget: z.number().int().min(MINIMUM_QUOTE_BUDGET).max(1000000),
  productId: z.string().refine((id) => id === "" || catalogueProducts.some((product) => product.id === id), "Choose a valid catalogue item.").default(""),
  deliveryDate: z.iso.date().refine((v) => v >= new Date().toISOString().slice(0, 10), "Choose a future delivery date."),
  locations: z.string().trim().min(2).max(500),
  personalization: z.boolean(),
  requirements: z.string().trim().max(2000),
  consent: z.literal(true, "Please consent to being contacted about your enquiry."),
}).strict();
