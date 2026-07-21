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

/** Kept as a string for the input field; parse with Number() after validation. */
export const contributionSchema = z.object({
  amount: z
    .string()
    .min(1, "Enter an amount")
    .regex(/^\d+$/, "Whole credits only — no decimals or symbols")
    .refine((v) => Number(v) >= 10, "Minimum contribution is 10 credits"),
});

export type ContributionInput = z.infer<typeof contributionSchema>;
