import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { paceSecondsPerKm, estimated1RM } from "@/lib/utils";

const noStore = () => ({ "Cache-Control": "no-store, no-cache, must-revalidate" });

export interface CardioPR {
  type: "pace_5k" | "pace_10k" | "longest_run" | "fastest_5k";
  label: string;
  value: string;
  date: string;
  sessionId: string;
}

export interface StrengthPR {
  exerciseName: string;
  maxWeightKg: number;
  reps: number;
  estimated1RM: number;
  date: string;
  sessionId: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const whereUser =
      session.userId === "env-fallback"
        ? undefined
        : { userId: session.userId };

    // --- Cardio PRs ---
    const cardioSessions = await prisma.cardioSession.findMany({
      where: whereUser,
      orderBy: { date: "desc" },
    });

    const cardioPRs: CardioPR[] = [];
    let bestPace5k: { pace: number; date: string; id: string } | null = null;
    let bestPace10k: { pace: number; date: string; id: string } | null = null;
    let longestRun: { km: number; date: string; id: string } | null = null;
    let fastest5k: { sec: number; date: string; id: string } | null = null;

    for (const s of cardioSessions) {
      const pace = paceSecondsPerKm(s.durationSeconds, s.distanceKm);
      if (pace == null) continue;
      const dateStr = s.date.toISOString().slice(0, 10);

      if (s.distanceKm >= 5 && (bestPace5k == null || pace < bestPace5k.pace)) {
        bestPace5k = { pace, date: dateStr, id: s.id };
      }
      if (s.distanceKm >= 10 && (bestPace10k == null || pace < bestPace10k.pace)) {
        bestPace10k = { pace, date: dateStr, id: s.id };
      }
      if (longestRun == null || s.distanceKm > longestRun.km) {
        longestRun = { km: s.distanceKm, date: dateStr, id: s.id };
      }
      if (s.distanceKm >= 4.5 && s.distanceKm <= 5.5) {
        const totalSec = s.durationSeconds;
        if (fastest5k == null || totalSec < fastest5k.sec) {
          fastest5k = { sec: totalSec, date: dateStr, id: s.id };
        }
      }
    }

    const formatPace = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.round(sec % 60);
      return `${m}:${s.toString().padStart(2, "0")}/km`;
    };
    if (bestPace5k) {
      cardioPRs.push({
        type: "pace_5k",
        label: "Melhor pace 5 km",
        value: formatPace(bestPace5k.pace),
        date: bestPace5k.date,
        sessionId: bestPace5k.id,
      });
    }
    if (bestPace10k) {
      cardioPRs.push({
        type: "pace_10k",
        label: "Melhor pace 10 km",
        value: formatPace(bestPace10k.pace),
        date: bestPace10k.date,
        sessionId: bestPace10k.id,
      });
    }
    if (longestRun) {
      cardioPRs.push({
        type: "longest_run",
        label: "Maior distância",
        value: `${longestRun.km.toFixed(1)} km`,
        date: longestRun.date,
        sessionId: longestRun.id,
      });
    }
    if (fastest5k) {
      const m = Math.floor(fastest5k.sec / 60);
      const s = fastest5k.sec % 60;
      cardioPRs.push({
        type: "fastest_5k",
        label: "5 km mais rápido",
        value: `${m}:${s.toString().padStart(2, "0")}`,
        date: fastest5k.date,
        sessionId: fastest5k.id,
      });
    }

    // --- Strength PRs (max weight per exercise, with estimated 1RM) ---
    const strengthSessions = await prisma.strengthSession.findMany({
      where: whereUser,
      include: { sets: true },
      orderBy: { date: "desc" },
    });

    const byExercise = new Map<
      string,
      { weightKg: number; reps: number; date: string; sessionId: string }
    >();
    for (const sess of strengthSessions) {
      for (const set of sess.sets) {
        if (set.weightKg <= 0) continue;
        const key = set.exerciseName.trim();
        const e1rm = estimated1RM(set.weightKg, set.reps);
        const existing = byExercise.get(key);
        const existingE1rm = existing ? estimated1RM(existing.weightKg, existing.reps) : 0;
        if (!existing || e1rm > existingE1rm) {
          byExercise.set(key, {
            weightKg: set.weightKg,
            reps: set.reps,
            date: sess.date.toISOString().slice(0, 10),
            sessionId: sess.id,
          });
        }
      }
    }

    const strengthPRs: StrengthPR[] = Array.from(byExercise.entries()).map(
      ([exerciseName, data]) => ({
        exerciseName,
        maxWeightKg: data.weightKg,
        reps: data.reps,
        estimated1RM: estimated1RM(data.weightKg, data.reps),
        date: data.date,
        sessionId: data.sessionId,
      })
    );
    strengthPRs.sort((a, b) => b.estimated1RM - a.estimated1RM);

    return NextResponse.json(
      { cardio: cardioPRs, strength: strengthPRs },
      { headers: noStore() }
    );
  } catch (error) {
    console.error("GET /api/prs", error);
    return NextResponse.json(
      { error: "Falha ao carregar PRs" },
      { status: 500 }
    );
  }
}
