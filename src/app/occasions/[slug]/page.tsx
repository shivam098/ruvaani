import { notFound } from "next/navigation";
import { CollectionLanding } from "@/components/collection-landing";
import { giftOccasions } from "@/lib/discovery";
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export const dynamicParams = false;
export function generateStaticParams() { return giftOccasions.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) { const { slug } = await params; const item = giftOccasions.find((c) => c.slug === slug); return { title: item?.title ?? "Occasion not found", description: item?.description }; }
export default async function OccasionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const collection = giftOccasions.find((item) => item.slug === slug);
  if (!collection) notFound();
  return <CollectionLanding collection={collection} initial={await searchParams} />;
}
