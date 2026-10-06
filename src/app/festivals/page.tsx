import { CollectionDirectory } from "@/components/collection-directory";
import { giftFestivals } from "@/lib/discovery";
export const metadata = { title: "Festival Edits" };
export default function Festivals() { return <CollectionDirectory title="A little celebration. A lasting memory." description="Seasonal inspiration from our existing catalogue. Final festival additions, contents and delivery are confirmed with your brief." collections={giftFestivals} />; }
