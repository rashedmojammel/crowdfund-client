// Zod schemas shared by the auth forms (and later the campaign /
// contribution / withdrawal forms listed in ARCHITECTURE.md).

import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/[0-9]/, "Password must include at least one number"),
  /** Profile picture URL — filled by ImgBB upload or pasted directly. */
  image: z.union([z.url("Profile picture must be a valid URL"), z.literal("")]),
  role: z.enum(["supporter", "creator"], { message: "Choose how you want to join" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const campaignSchema = z.object({
  title: z.string().min(8, "Title must be at least 8 characters"),
  category: z.enum(
    ["technology", "education", "health", "environment", "community", "creative"],
    { message: "Pick a category" }
  ),
  story: z
    .string()
    .min(100, "Tell the full story — at least 100 characters so backers can judge the plan"),
  reward: z.string().min(20, "Describe the backer reward in at least 20 characters"),
  image: z.url("Upload a cover image or paste an image URL"),
  /** Credits, kept as a string for the input field. */
  funding_goal: z
    .string()
    .min(1, "Set a funding goal")
    .regex(/^\d+$/, "Whole credits only")
    .refine((v) => Number(v) >= 1000, "Goal must be at least 1,000 credits"),
  /** yyyy-mm-dd from the date input. */
  deadline: z
    .string()
    .min(1, "Pick a deadline")
    .refine(
      (v) => new Date(`${v}T23:59:59`).getTime() > Date.now(),
      "Deadline must be in the future"
    ),
});

export type CampaignInput = z.infer<typeof campaignSchema>;

/** Only these three fields are editable after a campaign is created. */
export const updateCampaignSchema = campaignSchema.pick({
  title: true,
  story: true,
  reward: true,
});

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

export const withdrawalSchema = z.object({
  /** Credits, kept as a string for the input field. */
  credits: z
    .string()
    .min(1, "Enter an amount")
    .regex(/^\d+$/, "Whole credits only")
    .refine((v) => Number(v) >= 200, "Minimum withdrawal is 200 credits"),
  paymentSystem: z.enum(["bKash", "Nagad", "Bank Transfer", "PayPal"], {
    message: "Pick a payout method",
  }),
  accountNumber: z.string().min(6, "Enter the receiving account number"),
});

export type WithdrawalInput = z.infer<typeof withdrawalSchema>;

/** Kept as a string for the input field; parse with Number() after validation. */
export const contributionSchema = z.object({
  amount: z
    .string()
    .min(1, "Enter an amount")
    .regex(/^\d+$/, "Whole credits only — no decimals or symbols")
    .refine((v) => Number(v) >= 10, "Minimum contribution is 10 credits"),
});

export type ContributionInput = z.infer<typeof contributionSchema>;
