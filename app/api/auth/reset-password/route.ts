import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { validatePasswordStrength } from "@/lib/password";

const bodySchema = z.object({
  token: z.string().min(1, "Token inválido"),
  newPassword: z.string().min(1, "Informe a nova senha"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.flatten().fieldErrors?.token?.[0] ??
        parsed.error.flatten().fieldErrors?.newPassword?.[0] ??
        "Dados inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { token, newPassword } = parsed.data;
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.error }, { status: 400 });
    }
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!resetRecord) {
      return NextResponse.json(
        { error: "Link inválido ou expirado. Solicite um novo." },
        { status: 400 }
      );
    }
    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }).catch(() => {});
      return NextResponse.json(
        { error: "Link expirado. Solicite um novo." },
        { status: 400 }
      );
    }
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao redefinir senha." },
      { status: 500 }
    );
  }
}
