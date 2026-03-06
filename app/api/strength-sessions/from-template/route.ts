import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fromTemplateSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";
import { apiError, apiValidationError } from "@/lib/api-response";
import { checkAndUnlockAchievements } from "@/lib/achievements-unlock";

function canAccess(userId: string, resourceUserId: string | null): boolean {
  if (userId === "env-fallback") return true;
  return resourceUserId === userId;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSession(request);
    if (!auth) {
      return apiError("Não autorizado", 401, { code: "UNAUTHORIZED" });
    }
    const body = await request.json();
    const parsed = fromTemplateSchema.safeParse({
      ...body,
      date: body.date ?? new Date().toISOString(),
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const firstMessage =
        flat.formErrors[0] ?? Object.values(flat.fieldErrors).flat().find(Boolean) ?? "Dados inválidos";
      return apiValidationError(firstMessage, flat.fieldErrors as Record<string, string[] | undefined>);
    }
    const template = await prisma.strengthTemplate.findUnique({
      where: { id: parsed.data.templateId },
      include: { exercises: { orderBy: { order: "asc" } } },
    });
    if (!template) {
      return apiError("Template não encontrado", 404, { code: "NOT_FOUND" });
    }
    if (!canAccess(auth.userId, template.userId)) {
      return apiError("Template não encontrado", 404, { code: "NOT_FOUND" });
    }
    const userId = auth.userId === "env-fallback" ? null : auth.userId;
    const session = await prisma.strengthSession.create({
      data: {
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
        userId,
        sets: {
          create: template.exercises.flatMap((ex) =>
            Array.from({ length: ex.setsCount }, (_, i) => ({
              exerciseName: ex.exerciseName,
              setNumber: i + 1,
              reps: ex.defaultReps ?? 0,
              weightKg: ex.defaultWeightKg ?? 0,
            }))
          ),
        },
      },
      include: { sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] } },
    });

    let newlyUnlockedList: { slug: string; name: string }[] = [];
    if (userId) {
      await prisma.user.updateMany({
        where: { id: userId, usedTemplateAt: null },
        data: { usedTemplateAt: new Date() },
      });
      const { newlyUnlocked } = await checkAndUnlockAchievements(prisma, userId, {});
      newlyUnlockedList = newlyUnlocked;
    }

    return NextResponse.json({
      id: session.id,
      date: session.date.toISOString(),
      notes: session.notes,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      sets: session.sets.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
      newlyUnlocked: newlyUnlockedList,
    });
  } catch (error) {
    console.error("POST /api/strength-sessions/from-template", error);
    return apiError("Falha ao criar treino a partir do template", 500, { code: "INTERNAL_ERROR" });
  }
}
