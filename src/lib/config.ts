export const isDemoMode = () => {
  if (process.env.DEMO_MODE === "false") return false;
  if (process.env.DEMO_MODE === "true") return true;
  // If MongoDB URI is configured and not explicitly forced into demo, run in live database mode
  return !process.env.MONGODB_URI;
};
export const isAnalyticsEnabled = () => !isDemoMode() && process.env.ANALYTICS_ENABLED === "true";
export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function requireLiveMode() {
  if (isDemoMode()) throw new Error("This is a demo. No real accounts, enquiries or payments are accepted.");
}
