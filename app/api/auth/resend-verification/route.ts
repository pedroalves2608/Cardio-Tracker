import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canSendEmail, sendVerificationEmail } from "@/lib/email";

const COOLDOWN_MS = 5 * 60 * 1000; // 5 min
const TOKEN_EXPIRY_HOURS = 24;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (session.userId === "env-fallback") {
      return NextResponse.json(
        { error: "Conta de ambiente não tem email para verificar." },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, emailVerifiedAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    if (!user.email) {
      return NextResponse.json(
        { error: "Não há email cadastrado para reenviar confirmação." },
        { status: 400 }
      );
    }
    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Email já está verificado." },
        { status: 400 }
      );
    }
    const recent = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < COOLDOWN_MS) {
      const waitMin = Math.ceil((COOLDOWN_MS - (Date.now() - recent.createdAt.getTime())) / 60000);
      return NextResponse.json(
        { error: `Aguarde ${waitMin} minuto(s) para reenviar o email.` },
        { status: 429 }
      );
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    await prisma.emailVerificationToken.create({
      data: { token, userId: user.id, expiresAt },
    });
    const baseUrl = request.nextUrl.origin;
    const verifyLink = `${baseUrl}/verify-email?token=${token}`;
    if (canSendEmail()) {
      const sent = await sendVerificationEmail(user.email, verifyLink);
      if (!sent) {
        await prisma.emailVerificationToken.deleteMany({ where: { token } }).catch(() => {});
        return NextResponse.json(
          { error: "Falha ao enviar email. Tente novamente." },
          { status: 500 }
        );
      }
    }
    return NextResponse.json({
      ok: true,
      message: canSendEmail()
        ? "Email de confirmação reenviado."
        : "Link gerado. Configure RESEND_API_KEY para enviar por email.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao reenviar confirmação." },
      { status: 500 }
    );
  }
}
