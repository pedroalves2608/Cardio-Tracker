import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWorkoutSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";
import { apiError, apiValidationError } from "@/lib/api-response";
import { parseGoalsJson } from "@/lib/goals";
import { checkCardioNewPr } from "@/lib/check-pr-goal";
import { checkAndUnlockAchievements } from "@/lib/achievements-unlock";
import { startOfWeek, isWithinInterval } from "date-fns";

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
    const sessions = await prisma.cardioSession.findMany({
      where,
      orderBy: { date: "desc" },
    });
    const data = sessions.map((s) => ({
      ...s,
      date: s.date.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
    return NextResponse.json(data, { headers: noStore() });
  } catch (error) {
    console.error("GET /api/workouts", error);
    return NextResponse.json(
      { error: "Falha ao listar treinos" },
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
    const parsed = createWorkoutSchema.safeParse({
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
    const { date, durationSeconds, distanceKm, ankleWeight, ankleWeightKg, notes } = parsed.data;
    const weightKg =
      ankleWeightKg != null && Number(ankleWeightKg) > 0 ? Number(ankleWeightKg) : null;
    const userId = auth.userId === "env-fallback" ? null : auth.userId;
    const session = await prisma.cardioSession.create({
      data: {
        date: new Date(date),
        durationSeconds: Number(durationSeconds),
        distanceKm: Number(distanceKm),
        ankleWeight: Boolean(ankleWeight),
        ankleWeightKg: weightKg,
        notes: notes ?? null,
        userId,
      },
    });

    let newPr: { label: string } | undefined;
    let goalAttained = false;
    let newlyUnlockedList: { slug: string; name: string }[] = [];
    if (userId) {
      const allCardio = await prisma.cardioSession.findMany({
        where: { userId },
        select: { id: true, date: true, durationSeconds: true, distanceKm: true },
      });
      const prLabel = checkCardioNewPr(
        session.id,
        allCardio.map((s) => ({ ...s, date: s.date }))
      );
      if (prLabel) newPr = { label: prLabel };

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { goalsJson: true } });
      const goals = parseGoalsJson(user?.goalsJson);
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 0 });
      const weekCardio = allCardio.filter((s) => isWithinInterval(s.date, { start: weekStart, end: now }));
      const weekStrength = await prisma.strengthSession.count({
        where: { userId, date: { gte: weekStart, lte: now } },
      });
      const totalKm = weekCardio.reduce((a, w) => a + w.distanceKm, 0);
      if ((goals.cardioKmPerWeek ?? 0) > 0 && totalKm >= goals.cardioKmPerWeek!) goalAttained = true;
      if ((goals.cardioSessionsPerWeek ?? 0) > 0 && weekCardio.length >= goals.cardioSessionsPerWeek!) goalAttained = true;
      if ((goals.strengthSessionsPerWeek ?? 0) > 0 && weekStrength >= goals.strengthSessionsPerWeek!) goalAttained = true;
      if ((goals.workoutsPerWeek ?? 0) > 0 && weekCardio.length + weekStrength >= goals.workoutsPerWeek!) goalAttained = true;
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
      durationSeconds: session.durationSeconds,
      distanceKm: session.distanceKm,
      ankleWeight: session.ankleWeight,
      ankleWeightKg: session.ankleWeightKg,
      notes: session.notes,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      newPr,
      goalAttained,
      newlyUnlocked: newlyUnlockedList,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("POST /api/workouts", message, error);
    const msg =
      process.env.NODE_ENV === "development"
        ? `Falha ao criar treino: ${message}`
        : "Falha ao criar treino";
    return apiError(msg, 500, { code: "INTERNAL_ERROR" });
  }
}
