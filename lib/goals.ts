/**
 * User goals (weekly targets). Stored as JSON in User.goalsJson.
 */
export interface UserGoals {
  cardioKmPerWeek?: number;
  cardioSessionsPerWeek?: number;
  strengthSessionsPerWeek?: number;
  workoutsPerWeek?: number;
}

const DEFAULT_GOALS: UserGoals = {};

export function parseGoalsJson(json: string | null | undefined): UserGoals {
  if (!json || typeof json !== "string") return { ...DEFAULT_GOALS };
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return {
      cardioKmPerWeek: typeof parsed.cardioKmPerWeek === "number" ? parsed.cardioKmPerWeek : undefined,
      cardioSessionsPerWeek: typeof parsed.cardioSessionsPerWeek === "number" ? parsed.cardioSessionsPerWeek : undefined,
      strengthSessionsPerWeek: typeof parsed.strengthSessionsPerWeek === "number" ? parsed.strengthSessionsPerWeek : undefined,
      workoutsPerWeek: typeof parsed.workoutsPerWeek === "number" ? parsed.workoutsPerWeek : undefined,
    };
  } catch {
    return { ...DEFAULT_GOALS };
  }
}

export function stringifyGoals(goals: UserGoals): string {
  return JSON.stringify(goals);
}
