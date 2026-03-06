import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { error: "Token inválido." },
        { status: 400 }
      );
    }
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!record) {
      return NextResponse.json(
        { error: "Link inválido ou já utilizado." },
        { status: 400 }
      );
    }
    if (record.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { id: record.id } }).catch(() => {});
      return NextResponse.json(
        { error: "Link expirado. Solicite um novo na página de perfil." },
        { status: 400 }
      );
    }
    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    });
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao confirmar email." },
      { status: 500 }
    );
  }
}
