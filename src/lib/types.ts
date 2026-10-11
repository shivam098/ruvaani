export type Category = "Hampers" | "Desk essentials" | "Wellness" | "Gourmet" | "Eco-friendly";
export type Artwork = "hamper" | "desk" | "wellness" | "gourmet" | "eco" | "festive";

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category: Category;
  price: number;
  compareAtPrice: number;
  stock: number;
  minimumOrderQuantity: number;
  personalizable: boolean;
  artwork: Artwork;
  color: string;
  badge?: string;
  occasions: string[];
  recipients: string[];
  includes: string[];
  featured: boolean;
  active: boolean;
}

export interface CartLine {
  productId: string;
  quantity: number;
  name: string;
  message: string;
}

export type UserRole = "CUSTOMER" | "CORPORATE" | "MERCHANT" | "ADMIN" | "SUPER_ADMIN";

export interface UserView {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status?: string;
}

export interface Address {
  name: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export type QuoteStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "QUOTE_SENT"
  | "NEGOTIATION"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED_TO_ORDER";

export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "CREATED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "REFUNDED";

export interface OrderView {
  id: string;
  number: string;
  createdAt: string;
  total: number;
  paymentStatus: string;
  status: string;
  items: { productId: string; name: string; quantity: number; unitPrice: number; personalization: { name: string; message: string } }[];
  trackingNumber?: string;
  carrier?: string;
}

export interface RecipientItem {
  id?: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
  gift?: string;
  status?: string;
}

export interface CouponView {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  active: boolean;
}
