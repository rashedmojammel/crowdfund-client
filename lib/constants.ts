import type { CampaignCategory } from "@/types";

export const CATEGORIES: Array<{
  value: CampaignCategory;
  label: string;
  blurb: string;
}> = [
  {
    value: "technology",
    label: "Technology",
    blurb: "Games, hardware, and open-source tools",
  },
  {
    value: "education",
    label: "Education",
    blurb: "Schools, bootcamps, and libraries",
  },
  {
    value: "health",
    label: "Health",
    blurb: "Clinics, equipment, and care access",
  },
  {
    value: "environment",
    label: "Environment",
    blurb: "Rivers, forests, and clean energy",
  },
  {
    value: "community",
    label: "Community",
    blurb: "Neighbourhood projects and animal welfare",
  },
  {
    value: "creative",
    label: "Creative",
    blurb: "Crafts, film, and cultural heritage",
  },
];

/** Neutral 1×1 placeholder for next/image blur-up (rule: images never pop in). */
export const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPcvXHZfwAGyALhcrDIJQAAAABJRU5ErkJggg==";
