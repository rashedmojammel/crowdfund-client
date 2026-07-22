// Mints the short-lived JWT the client attaches as "Authorization: Bearer"
// on every call to the real server (crowdfund-server, port 4000). Signed
// with the same BETTER_AUTH_SECRET the server verifies with via jose
// (see ../crowdfund-server/lib/auth.ts verifyRequest) — payload shape
// { id, email, role } must match exactly what that file destructures.
//
// A hand-rolled route rather than BetterAuth's built-in jwt() plugin: that
// plugin signs with an asymmetric key published via JWKS, which is a
// different trust model than the shared-secret HMAC verification the server
// already implements.

import { SignJWT } from "jose";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const TOKEN_TTL = "15m";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    return Response.json({ message: "Server misconfigured" }, { status: 500 });
  }

  const { id, email, role } = session.user as {
    id: string;
    email: string;
    role: string;
  };

  const token = await new SignJWT({ id, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(new TextEncoder().encode(secret));

  return Response.json({ token });
}
