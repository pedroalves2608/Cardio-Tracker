import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  user: z.string().min(1, "Informe o usuário"),
  password: z.string().min(1, "Informe a senha"),
});

const COOKIE_NAME = "cardio_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors?.user?.[0]
        ?? parsed.error.flatten().fieldErrors?.password?.[0]
        ?? "Dados inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { user, password } = parsed.data;
    const envUser = process.env.LOGIN_USER ?? "admin";
    const envPassword = process.env.LOGIN_PASSWORD ?? "admin";
    const secret = process.env.SESSION_SECRET ?? "cardio-secret-change-me";

    if (user !== envUser || password !== envPassword) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar login." },
      { status: 500 }
    );
  }
}
