import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateStrengthTemplateSchema } from "@/lib/validation";
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
    const template = await prisma.strengthTemplate.findUnique({
      where: { id },
      include: { exercises: { orderBy: { order: "asc" } } },
    });
    if (!template) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }
    if (!canAccess(auth.userId, template.userId)) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      ...template,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      exercises: template.exercises.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/strength-templates/[id]", error);
    return NextResponse.json(
      { error: "Falha ao buscar template" },
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
    const existing = await prisma.strengthTemplate.findUnique({
      where: { id },
      include: { exercises: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }
    if (!canAccess(auth.userId, existing.userId)) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }
    const body = await request.json();
    const parsed = updateStrengthTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    if (parsed.data.name != null) {
      await prisma.strengthTemplate.update({
        where: { id },
        data: { name: parsed.data.name.trim() },
      });
    }
    if (parsed.data.exercises != null && parsed.data.exercises.length > 0) {
      await prisma.strengthTemplateExercise.deleteMany({ where: { templateId: id } });
      await prisma.strengthTemplateExercise.createMany({
        data: parsed.data.exercises.map((e, i) => ({
          templateId: id,
          exerciseName: e.exerciseName.trim(),
          order: e.order ?? i,
          setsCount: e.setsCount,
          defaultReps: e.defaultReps ?? null,
          defaultWeightKg: e.defaultWeightKg ?? null,
        })),
      });
    }
    const updated = await prisma.strengthTemplate.findUnique({
      where: { id },
      include: { exercises: { orderBy: { order: "asc" } } },
    });
    if (!updated) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      exercises: updated.exercises.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("PUT /api/strength-templates/[id]", error);
    return NextResponse.json(
      { error: "Falha ao atualizar template" },
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
    const existing = await prisma.strengthTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }
    if (!canAccess(auth.userId, existing.userId)) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }
    await prisma.strengthTemplate.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
  } catch (error) {
    console.error("DELETE /api/strength-templates/[id]", error);
    return NextResponse.json(
      { error: "Template não encontrado ou falha ao excluir" },
      { status: 404 }
    );
  }
}
