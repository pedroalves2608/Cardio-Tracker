import { paceSecondsPerKm, estimated1RM } from "@/lib/utils";

export type CardioSessionForCheck = {
  id: string;
  date: Date;
  durationSeconds: number;
  distanceKm: number;
};

/**
 * Returns the PR label if the given session (by id) is the new record for any cardio category.
 */
export function checkCardioNewPr(
  sessionId: string,
  sessions: CardioSessionForCheck[]
): string | null {
  let bestPace5kId: string | null = null;
  let bestPace5kPace: number | null = null;
  let bestPace10kId: string | null = null;
  let bestPace10kPace: number | null = null;
  let longestRunId: string | null = null;
  let longestRunKm = 0;
  let fastest5kId: string | null = null;
  let fastest5kSec = Infinity;

  for (const s of sessions) {
    const pace = paceSecondsPerKm(s.durationSeconds, s.distanceKm);
    if (pace == null) continue;
    if (s.distanceKm >= 5 && (bestPace5kPace == null || pace < bestPace5kPace)) {
      bestPace5kPace = pace;
      bestPace5kId = s.id;
    }
    if (s.distanceKm >= 10 && (bestPace10kPace == null || pace < bestPace10kPace)) {
      bestPace10kPace = pace;
      bestPace10kId = s.id;
    }
    if (s.distanceKm > longestRunKm) {
      longestRunKm = s.distanceKm;
      longestRunId = s.id;
    }
    if (s.distanceKm >= 4.5 && s.distanceKm <= 5.5 && s.durationSeconds < fastest5kSec) {
      fastest5kSec = s.durationSeconds;
      fastest5kId = s.id;
    }
  }
  if (sessionId === bestPace5kId) return "Melhor pace 5 km";
  if (sessionId === bestPace10kId) return "Melhor pace 10 km";
  if (sessionId === longestRunId) return "Maior distância";
  if (sessionId === fastest5kId) return "5 km mais rápido";
  return null;
}

export type StrengthSetForCheck = {
  exerciseName: string;
  weightKg: number;
  reps: number;
};

export type StrengthSessionForCheck = {
  id: string;
  sets: StrengthSetForCheck[];
};

/**
 * Returns the exercise name if this session set a new estimated 1RM PR for that exercise.
 */
export function checkStrengthNewPrByExercise(
  sessionId: string,
  sessions: StrengthSessionForCheck[]
): string | null {
  const byExercise = new Map<string, { e1rm: number; sessionId: string }>();
  for (const sess of sessions) {
    for (const set of sess.sets) {
      if (set.weightKg <= 0) continue;
      const e1rm = estimated1RM(set.weightKg, set.reps);
      const key = set.exerciseName.trim();
      const existing = byExercise.get(key);
      if (!existing || e1rm > existing.e1rm) {
        byExercise.set(key, { e1rm, sessionId: sess.id });
      }
    }
  }
  for (const [exerciseName, v] of Array.from(byExercise.entries())) {
    if (v.sessionId === sessionId) return exerciseName;
  }
  return null;
}
