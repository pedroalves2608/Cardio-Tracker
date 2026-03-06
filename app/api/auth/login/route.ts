import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/session";
import { checkLoginRateLimit, clearLoginRateLimit } from "@/lib/rate-limit";
import { apiError, apiValidationError } from "@/lib/api-response";

const bodySchema = z.object({
  user: z.string().min(1, "Informe o usuário"),
  password: z.string().min(1, "Informe a senha"),
});

export async function POST(request: NextRequest) {
  try {
    const rate = await checkLoginRateLimit(request);
    if (!rate.allowed) {
      return apiError(
        `Muitas tentativas. Tente novamente em ${rate.retryAfter ?? 900} segundos.`,
        429,
        {
          code: "RATE_LIMIT",
          headers: rate.retryAfter
            ? { "Retry-After": String(rate.retryAfter) }
            : undefined,
        }
      );
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const msg = flat?.user?.[0] ?? flat?.password?.[0] ?? "Dados inválidos";
      return apiValidationError(msg, flat);
    }

    const { user, password } = parsed.data;
    const username = user.trim().toLowerCase();

    const dbUser = await prisma.user.findUnique({ where: { username } });
    if (dbUser) {
      const ok = await verifyPassword(password, dbUser.passwordHash);
      if (!ok) {
        return NextResponse.json(
          { error: "Usuário ou senha incorretos." },
          { status: 401 }
        );
      }
    } else {
      const envUser = (process.env.LOGIN_USER ?? "admin").toLowerCase();
      const envPassword = process.env.LOGIN_PASSWORD ?? "admin";
      if (username !== envUser || password !== envPassword) {
        return NextResponse.json(
          { error: "Usuário ou senha incorretos." },
          { status: 401 }
        );
      }
    }

    const userId = dbUser?.id ?? "env-fallback";
    const token = await createSessionToken(userId);
    await clearLoginRateLimit(request);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return res;
  } catch {
    return apiError("Erro ao processar login.", 500, { code: "INTERNAL_ERROR" });
  }
}
