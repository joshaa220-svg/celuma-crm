import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export type SessionUser = {
  id: number;
  email: string;
  role: "ADMIN" | "AGENT";
};

const COOKIE_NAME = "celuma_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "celuma-local-secret-change-me");

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ sub: String(user.id), email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const id = Number(payload.sub);
    const email = String(payload.email ?? "");
    const role = payload.role === "ADMIN" ? "ADMIN" : payload.role === "AGENT" ? "AGENT" : null;

    if (!id || !email || !role) {
      return null;
    }

    return { id, email, role };
  } catch {
    return null;
  }
}

export async function getServerSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export async function getRequestSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export function getSessionCookieName(): string {
  return COOKIE_NAME;
}
