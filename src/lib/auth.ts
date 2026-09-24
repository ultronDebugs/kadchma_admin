import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "kadchma_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, seconds

export type SessionPayload = { email: string; name: string; role: string };

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET is not configured — set a long random value in your environment");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.email !== "string" || typeof payload.name !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return { email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}
