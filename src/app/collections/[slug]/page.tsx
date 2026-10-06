import { notFound } from "next/navigation";
import { CollectionLanding } from "@/components/collection-landing";
import { giftCategories } from "@/lib/discovery";
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export const dynamicParams = false;
export function generateStaticParams() { return giftCategories.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) { const { slug } = await params; const item = giftCategories.find((c) => c.slug === slug); return { title: item?.title ?? "Collection not found", description: item?.description }; }
export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const collection = giftCategories.find((item) => item.slug === slug);
  if (!collection) notFound();
  return <CollectionLanding collection={collection} initial={await searchParams} />;
}
