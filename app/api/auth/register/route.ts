import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { validatePasswordStrength } from "@/lib/password";
import { createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/session";
import { canSendEmail, sendVerificationEmail } from "@/lib/email";

const bodySchema = z.object({
  user: z.string().min(2, "Usuário deve ter pelo menos 2 caracteres"),
  password: z.string().min(1, "Informe a senha"),
  email: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.union([z.string().email("Email inválido"), z.null()])
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.flatten().fieldErrors?.user?.[0] ??
        parsed.error.flatten().fieldErrors?.password?.[0] ??
        parsed.error.flatten().fieldErrors?.email?.[0] ??
        "Dados inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { user, password, email } = parsed.data;
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.error }, { status: 400 });
    }
    const username = user.trim().toLowerCase();
    const emailVal = typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;

    if (emailVal) {
      const existingEmail = await prisma.user.findUnique({ where: { email: emailVal } });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Já existe uma conta com este email." },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "Este usuário já existe. Escolha outro." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: { username, passwordHash, email: emailVal },
    });

    if (emailVal) {
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await prisma.emailVerificationToken.create({
        data: { token: verifyToken, userId: newUser.id, expiresAt },
      });
      const baseUrl = request.nextUrl.origin;
      const verifyLink = `${baseUrl}/verify-email?token=${verifyToken}`;
      if (canSendEmail()) {
        await sendVerificationEmail(emailVal, verifyLink);
      }
    }

    const token = await createSessionToken(newUser.id);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return res;
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("Register error", err);
    const safeMessage =
      process.env.NODE_ENV === "development"
        ? err.message
        : "Erro ao criar conta. Tente novamente.";
    return NextResponse.json(
      { error: safeMessage },
      { status: 500 }
    );
  }
}
