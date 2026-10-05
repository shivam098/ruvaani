import { cache } from "react";
import { catalogueProducts } from "./catalog-data";

export const getProducts = cache(async () => catalogueProducts);
