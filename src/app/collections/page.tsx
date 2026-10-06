import { CollectionDirectory } from "@/components/collection-directory";
import { giftCategories } from "@/lib/discovery";
export const metadata = { title: "Shop by Category" };
export default function Categories() { return <CollectionDirectory title="Find a gift that feels just right." description="Explore the supplied collection by gift type. Wellness and Tech & Utility are custom-enquiry categories, without listed standalone products." collections={giftCategories} />; }
