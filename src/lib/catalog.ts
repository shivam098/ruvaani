import { cache } from "react";
import { connection } from "next/server";
import { demoProducts } from "./catalog-data";
import { isDemoMode } from "./config";
import { connectDb } from "./db";
import { ProductModel } from "./models";
import type { Product } from "./types";

export const getProducts = cache(async (): Promise<Product[]> => {
  if (isDemoMode()) return demoProducts;
  await connection();
  await connectDb();
  const products = await ProductModel.find({ active: true }).select("-_id -__v -createdAt -updatedAt").lean();
  return products as Product[];
});
