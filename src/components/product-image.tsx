import Image from "next/image";
import type { CatalogueItem } from "@/lib/catalog-data";

export function ProductImage({ product, sizes = "(max-width: 760px) 50vw, 30vw" }: { product: CatalogueItem; sizes?: string }) {
  return <div className="catalogue-image">
    <Image src={product.image} alt={product.imageAlt} fill sizes={sizes} />
  </div>;
}
