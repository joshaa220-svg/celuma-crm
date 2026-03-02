import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, getSessionCookieName } from "@/lib/auth";
import { verifyPassword } from "@/lib/security";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Credenciales incompletas" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = await createSessionToken({ id: user.id, email: user.email, role: user.role });
  const response = NextResponse.json({ ok: true, user: { email: user.email, role: user.role } });
  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
