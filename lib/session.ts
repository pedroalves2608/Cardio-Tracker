import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const COOKIE_NAME = "cardio_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias
const JWT_ISSUER = "cardio-tracker";

export { COOKIE_NAME, COOKIE_MAX_AGE };

const DEFAULT_SECRET = "cardio-secret-change-me";

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? DEFAULT_SECRET;
  if (process.env.NODE_ENV === "production" && secret === DEFAULT_SECRET) {
    throw new Error(
      "Defina SESSION_SECRET em produção (ex: openssl rand -base64 32). Não use o valor padrão."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE;
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(exp)
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: JWT_ISSUER,
    });
    const sub = payload.sub;
    if (typeof sub !== "string" || !sub) return null;
    return { userId: sub };
  } catch {
    return null;
  }
}

export async function getSession(request: NextRequest): Promise<{ userId: string } | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
