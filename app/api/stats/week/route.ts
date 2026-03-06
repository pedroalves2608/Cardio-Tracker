import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { parseGoalsJson } from "@/lib/goals";
import { paceSecondsPerKm } from "@/lib/utils";
import type { WeekStats } from "@/lib/types";
import { startOfWeek, isWithinInterval, endOfDay } from "date-fns";
import { getWorkoutDates, currentDayStreak, currentWeekStreak } from "@/lib/streak";

const noStore = () => ({ "Cache-Control": "no-store, no-cache, must-revalidate" } as const);

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = session.userId === "env-fallback" ? null : session.userId;
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfDay(new Date(weekStart));
    weekEnd.setDate(weekEnd.getDate() + 6);

    const whereUser = userId ? { userId } : undefined;

    const [cardioSessions, strengthSessions, user] = await Promise.all([
      prisma.cardioSession.findMany({
        where: whereUser,
        select: { date: true, durationSeconds: true, distanceKm: true },
      }),
      prisma.strengthSession.findMany({
        where: whereUser,
        include: { sets: true },
      }),
      userId ? prisma.user.findUnique({ where: { id: userId }, select: { goalsJson: true } }) : null,
    ]);

    const weekInterval = { start: weekStart, end: now };
    const cardioWeek = cardioSessions.filter((s) =>
      isWithinInterval(new Date(s.date), weekInterval)
    );
    const strengthWeek = strengthSessions.filter((s) =>
      isWithinInterval(new Date(s.date), weekInterval)
    );

    const totalCardioKm = cardioWeek.reduce((s, w) => s + w.distanceKm, 0);
    const totalCardioSec = cardioWeek.reduce((s, w) => s + w.durationSeconds, 0);
    const avgPace = totalCardioKm > 0 ? paceSecondsPerKm(totalCardioSec, totalCardioKm) : null;

    let totalVolumeKg = 0;
    for (const s of strengthWeek) {
      for (const set of s.sets) totalVolumeKg += set.reps * set.weightKg;
    }

    const goals = parseGoalsJson(user?.goalsJson ?? null);
    const targetCardioKm = goals.cardioKmPerWeek ?? 0;
    const targetCardioSessions = goals.cardioSessionsPerWeek ?? 0;
    const targetStrengthSessions = goals.strengthSessionsPerWeek ?? 0;
    const targetWorkouts = goals.workoutsPerWeek ?? 0;
    const totalWorkoutsWeek = cardioWeek.length + strengthWeek.length;

    const workoutDates = getWorkoutDates(
      cardioSessions.map((s) => new Date(s.date)),
      strengthSessions.map((s) => new Date(s.date))
    );
    const dayStreak = currentDayStreak(workoutDates, now);
    const weekStreak = currentWeekStreak(
      cardioSessions.map((s) => new Date(s.date)),
      strengthSessions.map((s) => new Date(s.date)),
      now
    );

    const allDates = [
      ...cardioSessions.map((s) => new Date(s.date)),
      ...strengthSessions.map((s) => new Date(s.date)),
    ];
    const lastWorkoutDate =
      allDates.length > 0
        ? new Date(Math.max(...allDates.map((d) => d.getTime()))).toISOString().slice(0, 10)
        : null;

    const stats: WeekStats = {
      weekStart: weekStart.toISOString().slice(0, 10),
      weekEnd: weekEnd.toISOString().slice(0, 10),
      cardio: {
        sessions: cardioWeek.length,
        totalKm: Math.round(totalCardioKm * 10) / 10,
        totalSeconds: totalCardioSec,
        avgPaceSecondsPerKm: avgPace,
      },
      strength: {
        sessions: strengthWeek.length,
        totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
      },
      goals: {
        cardioKmPerWeek: goals.cardioKmPerWeek,
        cardioSessionsPerWeek: goals.cardioSessionsPerWeek,
        strengthSessionsPerWeek: goals.strengthSessionsPerWeek,
        workoutsPerWeek: goals.workoutsPerWeek,
      },
      progress: {
        cardioKm: {
          current: totalCardioKm,
          target: targetCardioKm,
          attained: targetCardioKm > 0 && totalCardioKm >= targetCardioKm,
        },
        cardioSessions: {
          current: cardioWeek.length,
          target: targetCardioSessions,
          attained: targetCardioSessions > 0 && cardioWeek.length >= targetCardioSessions,
        },
        strengthSessions: {
          current: strengthWeek.length,
          target: targetStrengthSessions,
          attained: targetStrengthSessions > 0 && strengthWeek.length >= targetStrengthSessions,
        },
        workouts: {
          current: totalWorkoutsWeek,
          target: targetWorkouts,
          attained: targetWorkouts > 0 && totalWorkoutsWeek >= targetWorkouts,
        },
      },
      streak: {
        currentDayStreak: dayStreak,
        currentWeekStreak: weekStreak,
        lastWorkoutDate,
      },
    };

    return NextResponse.json(stats, { headers: noStore() });
  } catch (error) {
    console.error("GET /api/stats/week", error);
    return NextResponse.json({ error: "Falha ao carregar resumo" }, { status: 500 });
  }
}
