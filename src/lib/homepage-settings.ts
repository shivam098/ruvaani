import { cache } from "react";
import { connection } from "next/server";
import { isDemoMode } from "./config";
import { connectDb } from "./db";
import { HomepageModel } from "./models";
import { defaultHomepageContent, homepageContentSchema, type HomepageSettings } from "./homepage-content";

// Share one read between the layout and homepage, never cache across requests.
export const getHomepageSettings = cache(async (): Promise<HomepageSettings> => {
  if (isDemoMode()) return { revision: 0, content: defaultHomepageContent };
  await connection();
  await connectDb();
  const stored = await HomepageModel.findById("homepage").lean();
  if (!stored) return { revision: 0, content: defaultHomepageContent };
  return { revision: stored.revision, content: homepageContentSchema.parse(stored.content) };
});
