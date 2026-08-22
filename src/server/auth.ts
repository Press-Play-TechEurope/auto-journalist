import { SignJWT, jwtVerify } from "jose";

/**
 * Minimal single-user session: a signed JWT in an httpOnly cookie.
 * Edge-safe (used by middleware) — no Node-only imports here.
 */
export const SESSION_COOKIE = "aj_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secretKey(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(secret: string) {
  return new SignJWT({ sub: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey(secret));
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
) {
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey(secret), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
