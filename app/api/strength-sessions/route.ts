import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createStrengthSessionSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";
import { apiError, apiValidationError } from "@/lib/api-response";
import { parseGoalsJson } from "@/lib/goals";
import { checkStrengthNewPrByExercise } from "@/lib/check-pr-goal";
import { checkAndUnlockAchievements } from "@/lib/achievements-unlock";
import { startOfWeek, isWithinInterval } from "date-fns";

const noStore = () => ({ "Cache-Control": "no-store, no-cache, must-revalidate" });

function canAccess(userId: string, resourceUserId: string | null): boolean {
  if (userId === "env-fallback") return true;
  return resourceUserId === userId;
}

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
    const sessions = await prisma.strengthSession.findMany({
      where,
      orderBy: { date: "desc" },
      include: { sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] } },
    });
    const data = sessions.map((s) => ({
      ...s,
      date: s.date.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      sets: s.sets.map((set) => ({
        ...set,
        createdAt: set.createdAt.toISOString(),
      })),
    }));
    return NextResponse.json(data, { headers: noStore() });
  } catch (error) {
    console.error("GET /api/strength-sessions", error);
    return NextResponse.json(
      { error: "Falha ao listar treinos de força" },
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
    const parsed = createStrengthSessionSchema.safeParse({
      ...body,
      date: body.date ?? new Date().toISOString(),
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const firstField = flat.fieldErrors as Record<string, string[] | undefined>;
      const firstMessage =
        Object.values(firstField).flat().find(Boolean) ?? flat.formErrors[0] ?? "Dados inválidos";
      return apiValidationError(firstMessage, firstField);
    }
    const userId = auth.userId === "env-fallback" ? null : auth.userId;
    const session = await prisma.strengthSession.create({
      data: {
        date: new Date(parsed.data.date),
        notes: parsed.data.notes ?? null,
        userId,
        sets: {
          create: parsed.data.sets.map((s) => ({
            exerciseName: s.exerciseName.trim(),
            setNumber: s.setNumber,
            reps: s.reps,
            weightKg: s.weightKg,
          })),
        },
      },
      include: { sets: true },
    });

    let newPr: { label: string } | undefined;
    let goalAttained = false;
    let newlyUnlockedList: { slug: string; name: string }[] = [];
    if (userId) {
      const allStrength = await prisma.strengthSession.findMany({
        where: { userId },
        include: { sets: true },
      });
      const prExercise = checkStrengthNewPrByExercise(
        session.id,
        allStrength.map((s) => ({ id: s.id, sets: s.sets.map((x) => ({ exerciseName: x.exerciseName, weightKg: x.weightKg, reps: x.reps })) }))
      );
      if (prExercise) newPr = { label: prExercise };

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { goalsJson: true } });
      const goals = parseGoalsJson(user?.goalsJson);
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 0 });
      const weekCardio = await prisma.cardioSession.count({
        where: { userId, date: { gte: weekStart, lte: now } },
      });
      const weekStrength = allStrength.filter((s) => isWithinInterval(s.date, { start: weekStart, end: now }));
      if ((goals.cardioKmPerWeek ?? 0) > 0) {
        const weekCardioSessions = await prisma.cardioSession.findMany({
          where: { userId, date: { gte: weekStart, lte: now } },
          select: { distanceKm: true },
        });
        const totalKm = weekCardioSessions.reduce((a, w) => a + w.distanceKm, 0);
        if (totalKm >= goals.cardioKmPerWeek!) goalAttained = true;
      }
      if ((goals.cardioSessionsPerWeek ?? 0) > 0 && weekCardio >= goals.cardioSessionsPerWeek!) goalAttained = true;
      if ((goals.strengthSessionsPerWeek ?? 0) > 0 && weekStrength.length >= goals.strengthSessionsPerWeek!) goalAttained = true;
      if ((goals.workoutsPerWeek ?? 0) > 0 && weekCardio + weekStrength.length >= goals.workoutsPerWeek!) goalAttained = true;
      if (goalAttained) {
        await prisma.user.updateMany({
          where: { id: userId, weeklyGoalAttainedAt: null },
          data: { weeklyGoalAttainedAt: new Date() },
        });
      }
      const { newlyUnlocked } = await checkAndUnlockAchievements(prisma, userId, {
        newPrThisSession: !!newPr,
        goalAttainedThisSession: goalAttained,
      });
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
      newPr,
      goalAttained,
      newlyUnlocked: newlyUnlockedList,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("POST /api/strength-sessions", message, error);
    return apiError(
      process.env.NODE_ENV === "development" ? `Falha ao criar treino: ${message}` : "Falha ao criar treino",
      500,
      { code: "INTERNAL_ERROR" }
    );
  }
}
