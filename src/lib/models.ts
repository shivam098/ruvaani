import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { interactionEvents } from "./interaction-data";

const productSchema = new Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, required: true },
  stock: { type: Number, required: true, min: 0 },
  minimumOrderQuantity: { type: Number, default: 1, required: true },
  personalizable: { type: Boolean, required: true },
  artwork: { type: String, required: true },
  color: { type: String, required: true },
  badge: String,
  occasions: [String],
  recipients: [String],
  includes: [String],
  featured: { type: Boolean, default: false, required: true },
  active: { type: Boolean, default: true, required: true },
  sku: String,
  merchantId: { type: Schema.Types.ObjectId, ref: "Merchant" },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 0 },
  seoTitle: String,
  seoDescription: String,
  tags: [String],
  images: [String],
  gst: { type: Number, default: 18 },
}, { timestamps: true });

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["CUSTOMER", "CORPORATE", "MERCHANT", "ADMIN", "SUPER_ADMIN"], default: "CUSTOMER", required: true },
  phone: String,
  status: { type: String, enum: ["ACTIVE", "PENDING_VERIFICATION", "SUSPENDED"], default: "ACTIVE" },
}, { timestamps: true });

const sessionSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

const corporateAccountSchema = new Schema({
  companyName: { type: String, required: true },
  workEmail: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  designation: String,
  gstin: String,
  pan: String,
  industry: String,
  companySize: String,
  budgetRange: String,
  address: { line1: String, city: String, state: String, pincode: String },
  logoUrl: String,
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const recipientSchema = new Schema({
  corporateAccountId: { type: Schema.Types.ObjectId, ref: "CorporateAccount", index: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: String,
  pincode: { type: String, required: true },
  gift: String,
  status: { type: String, enum: ["PENDING", "DISPATCHED", "DELIVERED"], default: "PENDING" },
  personalizationNotes: String,
}, { timestamps: true });

const merchantSchema = new Schema({
  businessName: { type: String, required: true },
  brandName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  category: String,
  status: { type: String, enum: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "SUSPENDED"], default: "PENDING_APPROVAL" },
  commissionRate: { type: Number, default: 15 },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const merchantKycSchema = new Schema({
  merchantId: { type: Schema.Types.ObjectId, ref: "Merchant", required: true, unique: true },
  pan: String,
  gstin: String,
  bankDetails: {
    accountNumber: String,
    ifsc: String,
    accountHolder: String,
    bankName: String,
  },
  documentUrls: [String],
  status: { type: String, enum: ["PENDING", "VERIFIED", "REJECTED"], default: "PENDING" },
}, { timestamps: true });

const merchantSettlementSchema = new Schema({
  merchantId: { type: Schema.Types.ObjectId, ref: "Merchant", required: true, index: true },
  grossSales: { type: Number, required: true },
  platformCommission: { type: Number, required: true },
  shippingCharges: { type: Number, default: 0 },
  taxes: { type: Number, default: 0 },
  netEarnings: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "PROCESSING", "PAID"], default: "PENDING" },
  settlementDate: Date,
  payoutReference: String,
}, { timestamps: true });

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const occasionSchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  bannerImage: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

const festivalSchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  heroBanner: String,
  startDate: Date,
  endDate: Date,
  active: { type: Boolean, default: true },
}, { timestamps: true });

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: Number,
  applicableRoles: [String],
  validFrom: { type: Date, default: Date.now },
  validUntil: Date,
  usageLimit: { type: Number, default: 1000 },
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const orderSchema = new Schema({
  number: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  corporateAccountId: { type: Schema.Types.ObjectId, ref: "CorporateAccount" },
  idempotencyKey: { type: String, required: true, unique: true },
  requestHash: { type: String, required: true },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: String,
  items: [{
    _id: false,
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    personalization: { name: String, message: String },
  }],
  address: {
    name: String, email: String, phone: String, line1: String,
    city: String, state: String, pincode: String,
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: String,
  shipping: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ["CREATED", "PAYMENT_PENDING", "PAID", "FAILED", "CANCELLED", "REFUND_PENDING", "REFUNDED"],
    default: "PAYMENT_PENDING",
    required: true,
  },
  status: {
    type: String,
    enum: ["AWAITING_PAYMENT", "CONFIRMED", "PROCESSING", "PACKED", "READY_TO_SHIP", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"],
    default: "AWAITING_PAYMENT",
    required: true,
  },
  corporateOrder: { type: Boolean, default: false },
  quoteId: String,
  trackingNumber: String,
  carrier: String,
}, { timestamps: true });

const quoteSchema = new Schema({
  reference: { type: String, required: true, unique: true },
  name: String, company: String, email: String, phone: String,
  occasion: String, quantity: Number, budget: Number, deliveryDate: String,
  locations: String, personalization: Boolean, requirements: String,
  productId: String, productName: String,
  items: [{
    _id: false,
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    personalization: { name: String, message: String },
  }],
  customizationCost: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  corporateDiscount: { type: Number, default: 0 },
  totalQuoteAmount: Number,
  companyLogo: String,
  consentAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "QUOTE_SENT", "NEGOTIATION", "APPROVED", "REJECTED", "EXPIRED", "CONVERTED_TO_ORDER"],
    default: "SUBMITTED",
    required: true,
  },
  adminNotes: String,
  convertedOrderId: String,
}, { timestamps: true });

const reviewSchema = new Schema({
  productId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: false },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "APPROVED" },
}, { timestamps: true });

const supportTicketSchema = new Schema({
  ticketNumber: { type: String, required: true, unique: true },
  userId: String,
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: { type: String, required: true },
  category: { type: String, enum: ["ORDER", "CORPORATE", "DELIVERY", "CUSTOMIZATION", "PAYMENT", "OTHER"], default: "OTHER" },
  message: { type: String, required: true },
  status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"], default: "OPEN" },
  priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
}, { timestamps: true });

const aiConversationSchema = new Schema({
  sessionId: { type: String, required: true, index: true },
  userId: String,
  messages: [{
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  extractedIntent: {
    occasion: String,
    quantity: Number,
    budgetPerGift: Number,
    totalBudget: Number,
    recipient: String,
    category: String,
  },
  recommendations: [String],
}, { timestamps: true });

const rateSchema = new Schema({
  _id: { type: String, required: true },
  count: { type: Number, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

const auditSchema = new Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String, required: true },
}, { timestamps: true });

const interactionModelSchema = new Schema({
  _id: { type: String, required: true },
  day: { type: String, required: true, index: true },
  event: { type: String, enum: interactionEvents, required: true },
  target: { type: String, required: true },
  count: { type: Number, required: true, min: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { versionKey: false });

const homepageEventFields = {
  enabled: { type: Boolean, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ["Current event", "Upcoming event"], required: true },
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  accent: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  imageAlt: { type: String, required: true },
  primaryLabel: { type: String, required: true },
  primaryHref: { type: String, required: true },
  secondaryLabel: { type: String, required: true },
  secondaryHref: { type: String, required: true },
  note: { type: String, required: true },
};

const homepageSchema = new Schema({
  _id: { type: String, required: true },
  revision: { type: Number, required: true, min: 1 },
  content: {
    event: homepageEventFields,
    additionalEvent: { type: new Schema(homepageEventFields, { _id: false }), default: undefined },
    defaultEvent: { type: String, enum: ["event", "additionalEvent"], default: undefined },
    marquee: {
      enabled: { type: Boolean, required: true },
      message: { type: String, required: true },
      additionalMessages: { type: [String], default: undefined },
      href: { type: String, required: true },
    },
  },
}, { timestamps: true });

function model<S extends Schema>(name: string, schema: S): Model<InferSchemaType<S>> {
  return (mongoose.models[name] as Model<InferSchemaType<S>> | undefined) || mongoose.model<InferSchemaType<S>>(name, schema);
}

export const ProductModel = model("Product", productSchema);
export const UserModel = model("User", userSchema);
export const SessionModel = model("Session", sessionSchema);
export const OrderModel = model("Order", orderSchema);
export const QuoteModel = model("Quote", quoteSchema);
export const CorporateAccountModel = model("CorporateAccount", corporateAccountSchema);
export const RecipientModel = model("Recipient", recipientSchema);
export const MerchantModel = model("Merchant", merchantSchema);
export const MerchantKycModel = model("MerchantKyc", merchantKycSchema);
export const MerchantSettlementModel = model("MerchantSettlement", merchantSettlementSchema);
export const CategoryModel = model("Category", categorySchema);
export const OccasionModel = model("Occasion", occasionSchema);
export const FestivalModel = model("Festival", festivalSchema);
export const CouponModel = model("Coupon", couponSchema);
export const ReviewModel = model("Review", reviewSchema);
export const SupportTicketModel = model("SupportTicket", supportTicketSchema);
export const AIConversationModel = model("AIConversation", aiConversationSchema);
export const RateModel = model("RateLimit", rateSchema);
export const AuditModel = model("AuditLog", auditSchema);
export const HomepageModel = model("Homepage", homepageSchema);
export const InteractionModel = model("Interaction", interactionModelSchema);

export type StoredOrder = InferSchemaType<typeof orderSchema>;
