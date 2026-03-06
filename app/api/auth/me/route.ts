import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (session.userId === "env-fallback") {
      const username = (process.env.LOGIN_USER ?? "admin").toLowerCase();
      return NextResponse.json({
        user: { id: "env-fallback", username, email: null },
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, email: true, emailVerifiedAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: !!user.emailVerifiedAt,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}
