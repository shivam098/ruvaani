import type { Metadata } from "next";
import { GiftFinder } from "@/components/gift-finder";
export const metadata: Metadata = { title: "Find their kind of thoughtful", description: "Find a thoughtful gift in three simple steps. Choose your recipient, occasion and budget." };
export default function FinderPage() { return <GiftFinder />; }
