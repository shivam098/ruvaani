export const isDemoMode = () => process.env.DEMO_MODE !== "false";
export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function requireLiveMode() {
  if (isDemoMode()) throw new Error("This is a demo. No real accounts, enquiries or payments are accepted.");
}
