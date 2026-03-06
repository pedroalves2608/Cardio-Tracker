import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateWorkoutSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";

function canAccessWorkout(userId: string, workoutUserId: string | null): boolean {
  if (userId === "env-fallback") return true;
  return workoutUserId === userId;
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
    const session = await prisma.cardioSession.findUnique({ where: { id } });
    if (!session) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    if (!canAccessWorkout(auth.userId, session.userId)) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      ...session,
      date: session.date.toISOString(),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/workouts/[id]", error);
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
    const body = await request.json();
    const parsed = updateWorkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const existing = await prisma.cardioSession.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    if (!canAccessWorkout(auth.userId, existing.userId)) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.date != null) data.date = new Date(parsed.data.date as string);
    if (parsed.data.durationSeconds != null) data.durationSeconds = parsed.data.durationSeconds;
    if (parsed.data.distanceKm != null) data.distanceKm = parsed.data.distanceKm;
    if (parsed.data.ankleWeight != null) data.ankleWeight = parsed.data.ankleWeight;
    if (parsed.data.ankleWeightKg !== undefined)
      data.ankleWeightKg =
        parsed.data.ankleWeightKg != null && parsed.data.ankleWeightKg > 0
          ? parsed.data.ankleWeightKg
          : null;
    if (parsed.data.notes !== undefined) data.notes = parsed.data.notes ?? null;

    const session = await prisma.cardioSession.update({
      where: { id },
      data: data as Parameters<typeof prisma.cardioSession.update>[0]["data"],
    });
    return NextResponse.json({
      ...session,
      date: session.date.toISOString(),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PUT /api/workouts/[id]", error);
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
    const existing = await prisma.cardioSession.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    if (!canAccessWorkout(auth.userId, existing.userId)) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }
    await prisma.cardioSession.delete({ where: { id } });
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("DELETE /api/workouts/[id]", error);
    return NextResponse.json(
      { error: "Treino não encontrado ou falha ao excluir" },
      { status: 404 }
    );
  }
}
