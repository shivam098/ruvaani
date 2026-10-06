import { connectDb } from "./db";
import { isAnalyticsEnabled, isDemoMode } from "./config";
import { InteractionModel, QuoteModel } from "./models";
import type { AnalyticsSummary, Interaction } from "./interaction-data";

export async function recordInteraction({ event, target }: Interaction) {
  await connectDb();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const day = today.toISOString().slice(0, 10);
  await InteractionModel.updateOne({ _id: `${day}:${event}:${target}` }, {
    $inc: { count: 1 },
    $setOnInsert: { day, event, target, expiresAt: new Date(today.getTime() + 90 * 86400000) },
  }, { upsert: true, runValidators: true });
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (isDemoMode()) return { enabled: false, interactions: [], submittedEnquiries: 0 };
  await connectDb();
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 29);
  const [interactions, submittedEnquiries] = await Promise.all([
    InteractionModel.aggregate<Interaction & { count: number }>([
      { $match: { day: { $gte: start.toISOString().slice(0, 10) } } },
      { $group: { _id: { event: "$event", target: "$target" }, count: { $sum: "$count" } } },
      { $project: { _id: 0, event: "$_id.event", target: "$_id.target", count: 1 } },
      { $sort: { event: 1, count: -1, target: 1 } },
    ]),
    QuoteModel.countDocuments({ createdAt: { $gte: start } }),
  ]);
  return { enabled: isAnalyticsEnabled(), interactions, submittedEnquiries };
}
