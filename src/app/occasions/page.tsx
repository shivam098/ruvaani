import { CollectionDirectory } from "@/components/collection-directory";
import { giftOccasions } from "@/lib/discovery";
export const metadata = { title: "Gifts by Occasion" };
export default function Occasions() { return <CollectionDirectory title="For your people. For your moment." description="A thoughtful selection begins with the occasion and the relationship behind it." collections={giftOccasions} />; }
