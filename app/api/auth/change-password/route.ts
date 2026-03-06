import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { validatePasswordStrength } from "@/lib/password";

const bodySchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual"),
  newPassword: z.string().min(1, "Informe a nova senha"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (session.userId === "env-fallback") {
      return NextResponse.json(
        { error: "Alterar senha não disponível para login por variáveis de ambiente." },
        { status: 400 }
      );
    }
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.flatten().fieldErrors?.currentPassword?.[0] ??
        parsed.error.flatten().fieldErrors?.newPassword?.[0] ??
        "Dados inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { currentPassword, newPassword } = parsed.data;
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.error }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Senha atual incorreta." },
        { status: 400 }
      );
    }
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao alterar senha." },
      { status: 500 }
    );
  }
}
