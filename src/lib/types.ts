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

export interface UserView {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
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

export interface OrderView {
  id: string;
  number: string;
  createdAt: string;
  total: number;
  paymentStatus: string;
  status: string;
  items: { productId: string; name: string; quantity: number; unitPrice: number; personalization: { name: string; message: string } }[];
}
