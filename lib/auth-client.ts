// BetterAuth React client. Same-origin — no baseURL needed since the client
// app both serves the UI and mounts the BetterAuth route handler
// (app/api/auth/[...all]/route.ts).

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
