import type { Campaign } from "@/types";

// The database has some legacy-schema documents (snake_case fields from
// before the server's Mongoose model existed) mixed in with real ones —
// every field a real Campaign is guaranteed to have comes back undefined
// for those, which crashes anything that renders them (next/image,
// formatNumber, etc.). Used everywhere a campaign list gets rendered so one
// bad record can't take down the whole page.
export function isRenderableCampaign(campaign: Campaign): boolean {
  return (
    typeof campaign._id === "string" &&
    typeof campaign.title === "string" &&
    typeof campaign.coverImage === "string" &&
    campaign.coverImage.length > 0 &&
    typeof campaign.creatorEmail === "string" &&
    typeof campaign.fundingGoal === "number" &&
    typeof campaign.amountRaised === "number"
  );
}
