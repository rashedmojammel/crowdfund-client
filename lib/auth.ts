// BetterAuth server config. Writes to the same MongoDB "user" collection the
// server repo (../crowdfund-server) reads from — see lib/models/User.ts over
// there. role / credits / signupBonusGranted are additional fields layered
// on top of BetterAuth's built-in user shape (id, name, email, image, …).
//
// Credits and signupBonusGranted are never client-writable (input: false) —
// only the real server mutates them, via POST /api/auth/grant-signup-bonus
// and the credit-earning endpoints. See the "Shared state between the two
// repos" table in Architecture.md.

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URI!);

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db()),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        // Google sign-up never supplies this (no form step) — default to
        // supporter so first-time Google accounts don't fail to create.
        // Email/password sign-up always passes an explicit value from
        // RegisterForm's role select.
        defaultValue: "supporter",
        input: true,
      },
      credits: {
        type: "number",
        defaultValue: 0,
        input: false,
      },
      signupBonusGranted: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
});
