import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createStrengthTemplateSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";
import { apiError, apiValidationError } from "@/lib/api-response";
import { checkAndUnlockAchievements } from "@/lib/achievements-unlock";

const noStore = () => ({ "Cache-Control": "no-store, no-cache, must-revalidate" });

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return apiError("Não autorizado", 401, { code: "UNAUTHORIZED" });
    }
    const where =
      session.userId === "env-fallback"
        ? undefined
        : { userId: session.userId };
    const templates = await prisma.strengthTemplate.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { exercises: { orderBy: { order: "asc" } } },
    });
    const data = templates.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      exercises: t.exercises.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })),
    }));
    return NextResponse.json(data, { headers: noStore() });
  } catch (error) {
    console.error("GET /api/strength-templates", error);
    return NextResponse.json(
      { error: "Falha ao listar templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSession(request);
    if (!auth) {
      return apiError("Não autorizado", 401, { code: "UNAUTHORIZED" });
    }
    const body = await request.json();
    const parsed = createStrengthTemplateSchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const firstMessage =
        flat.formErrors[0] ?? Object.values(flat.fieldErrors).flat().find(Boolean) ?? "Dados inválidos";
      return apiValidationError(firstMessage, flat.fieldErrors as Record<string, string[] | undefined>);
    }
    const userId = auth.userId === "env-fallback" ? null : auth.userId;
    const template = await prisma.strengthTemplate.create({
      data: {
        name: parsed.data.name.trim(),
        userId,
        exercises: {
          create: parsed.data.exercises.map((e, i) => ({
            exerciseName: e.exerciseName.trim(),
            order: e.order ?? i,
            setsCount: e.setsCount,
            defaultReps: e.defaultReps ?? null,
            defaultWeightKg: e.defaultWeightKg ?? null,
          })),
        },
      },
      include: { exercises: { orderBy: { order: "asc" } } },
    });
    if (userId) {
      await checkAndUnlockAchievements(prisma, userId, {});
    }
    return NextResponse.json({
      id: template.id,
      name: template.name,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      exercises: template.exercises.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("POST /api/strength-templates", error);
    return apiError("Falha ao criar template", 500, { code: "INTERNAL_ERROR" });
  }
}
