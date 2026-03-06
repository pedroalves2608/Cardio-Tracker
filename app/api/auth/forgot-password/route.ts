import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { canSendEmail, sendPasswordResetEmail } from "@/lib/email";

const bodySchema = z.object({
  email: z.string().email("Email inválido"),
});

const RESET_EXPIRY_HOURS = 1;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors?.email?.[0] ?? "Email inválido";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { ok: true, message: "Se existir uma conta com este email, você receberá um link." }
      );
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });
    const baseUrl = request.nextUrl.origin;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    if (canSendEmail()) {
      const sent = await sendPasswordResetEmail(email, resetLink);
      if (!sent) {
        await prisma.passwordResetToken.deleteMany({ where: { token } }).catch(() => {});
        return NextResponse.json(
          { error: "Falha ao enviar email. Tente novamente mais tarde." },
          { status: 500 }
        );
      }
    } else if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        ok: true,
        message: "Link de redefinição criado. Configure RESEND_API_KEY para enviar por email.",
        resetLink,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Se existir uma conta com este email, você receberá um link de redefinição.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar solicitação." },
      { status: 500 }
    );
  }
}
