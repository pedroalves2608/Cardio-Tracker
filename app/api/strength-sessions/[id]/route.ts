import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateStrengthSessionSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";

function canAccess(userId: string, resourceUserId: string | null): boolean {
  if (userId === "env-fallback") return true;
  return resourceUserId === userId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const auth = await getSession(request);
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const session = await prisma.strengthSession.findUnique({
      where: { id },
      include: { sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] } },
    });
    if (!session) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    if (!canAccess(auth.userId, session.userId)) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      ...session,
      date: session.date.toISOString(),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      sets: session.sets.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/strength-sessions/[id]", error);
    return NextResponse.json(
      { error: "Falha ao buscar treino" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const auth = await getSession(request);
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const existing = await prisma.strengthSession.findUnique({ where: { id }, include: { sets: true } });
    if (!existing) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    if (!canAccess(auth.userId, existing.userId)) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    const body = await request.json();
    const parsed = updateStrengthSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    if (parsed.data.date != null) {
      await prisma.strengthSession.update({
        where: { id },
        data: { date: new Date(parsed.data.date), notes: parsed.data.notes ?? existing.notes },
      });
    }
    if (parsed.data.sets != null && parsed.data.sets.length > 0) {
      await prisma.strengthSet.deleteMany({ where: { sessionId: id } });
      await prisma.strengthSet.createMany({
        data: parsed.data.sets.map((s) => ({
          sessionId: id,
          exerciseName: s.exerciseName.trim(),
          setNumber: s.setNumber,
          reps: s.reps,
          weightKg: s.weightKg,
        })),
      });
    }
    const updated = await prisma.strengthSession.findUnique({
      where: { id },
      include: { sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] } },
    });
    if (!updated) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      ...updated,
      date: updated.date.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      sets: updated.sets.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("PUT /api/strength-sessions/[id]", error);
    return NextResponse.json(
      { error: "Falha ao atualizar treino" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const auth = await getSession(request);
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const existing = await prisma.strengthSession.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    if (!canAccess(auth.userId, existing.userId)) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    await prisma.strengthSession.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
  } catch (error) {
    console.error("DELETE /api/strength-sessions/[id]", error);
    return NextResponse.json(
      { error: "Treino não encontrado ou falha ao excluir" },
      { status: 404 }
    );
  }
}
