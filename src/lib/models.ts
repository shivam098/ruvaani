import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

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
}, { timestamps: true });

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER", required: true },
}, { timestamps: true });

const sessionSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

const orderSchema = new Schema({
  number: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
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
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["PAYMENT_PENDING", "PAID"], default: "PAYMENT_PENDING", required: true },
  status: { type: String, enum: ["AWAITING_PAYMENT", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"], default: "AWAITING_PAYMENT", required: true },
}, { timestamps: true });

const quoteSchema = new Schema({
  reference: { type: String, required: true, unique: true },
  name: String, company: String, email: String, phone: String,
  occasion: String, quantity: Number, budget: Number, deliveryDate: String,
  locations: String, personalization: Boolean, requirements: String,
  productId: String, productName: String,
  consentAt: { type: Date, required: true },
  status: { type: String, enum: ["SUBMITTED", "UNDER_REVIEW", "CONTACTED", "CLOSED"], default: "SUBMITTED", required: true },
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

function model<S extends Schema>(name: string, schema: S): Model<InferSchemaType<S>> {
  return (mongoose.models[name] as Model<InferSchemaType<S>> | undefined) || mongoose.model<InferSchemaType<S>>(name, schema);
}

export const ProductModel = model("Product", productSchema);
export const UserModel = model("User", userSchema);
export const SessionModel = model("Session", sessionSchema);
export const OrderModel = model("Order", orderSchema);
export const QuoteModel = model("Quote", quoteSchema);
export const RateModel = model("RateLimit", rateSchema);
export const AuditModel = model("AuditLog", auditSchema);
export type StoredOrder = InferSchemaType<typeof orderSchema>;
