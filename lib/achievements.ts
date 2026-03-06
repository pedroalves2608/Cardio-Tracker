/**
 * Conquistas: slugs fixos e regras de desbloqueio.
 */

export interface AchievementDef {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { slug: "first_workout", name: "Primeiro passo", description: "Registre seu primeiro treino", icon: "🎯" },
  { slug: "workouts_5", name: "Em movimento", description: "5 treinos registrados", icon: "🔥" },
  { slug: "workouts_10", name: "Dez treinos", description: "10 treinos registrados", icon: "💪" },
  { slug: "workouts_25", name: "Vinte e cinco", description: "25 treinos registrados", icon: "⭐" },
  { slug: "workouts_50", name: "Cinquenta", description: "50 treinos registrados", icon: "🏆" },
  { slug: "first_pr", name: "Primeiro recorde", description: "Bata seu primeiro PR (cardio ou força)", icon: "📈" },
  { slug: "streak_3", name: "Três dias", description: "3 dias seguidos com treino", icon: "🔥" },
  { slug: "streak_7", name: "Uma semana", description: "7 dias seguidos com treino", icon: "🌟" },
  { slug: "streak_14", name: "Duas semanas", description: "14 dias seguidos com treino", icon: "💎" },
  { slug: "goal_weekly", name: "Meta atingida", description: "Atinga sua meta semanal", icon: "✅" },
  { slug: "first_template", name: "Criador", description: "Crie seu primeiro template", icon: "📄" },
  { slug: "first_from_template", name: "Usou template", description: "Faça um treino a partir de um template", icon: "📋" },
  { slug: "cardio_km_10", name: "10 km", description: "Acumule 10 km de cardio", icon: "🛤️" },
  { slug: "cardio_km_50", name: "50 km", description: "Acumule 50 km de cardio", icon: "🏃" },
  { slug: "strength_10", name: "Força em dia", description: "10 treinos de força", icon: "🏋️" },
];

export type AchievementSlug = (typeof ACHIEVEMENTS)[number]["slug"];

export function getAchievementBySlug(slug: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.slug === slug);
}

export type StatsForAchievements = {
  totalWorkouts: number;
  totalCardioKm: number;
  totalStrengthSessions: number;
  currentDayStreak: number;
  hasUnlockedAnyPr: boolean;
  hasAttainedWeeklyGoal: boolean;
  totalTemplates: number;
  hasUsedTemplate: boolean;
};

/**
 * Returns slugs that should be unlocked given current stats (and that are not already unlocked).
 */
export function getAchievementsToUnlock(
  stats: StatsForAchievements,
  alreadyUnlocked: Set<string>
): string[] {
  const toUnlock: string[] = [];
  const add = (slug: string, condition: boolean) => {
    if (condition && !alreadyUnlocked.has(slug)) toUnlock.push(slug);
  };
  add("first_workout", stats.totalWorkouts >= 1);
  add("workouts_5", stats.totalWorkouts >= 5);
  add("workouts_10", stats.totalWorkouts >= 10);
  add("workouts_25", stats.totalWorkouts >= 25);
  add("workouts_50", stats.totalWorkouts >= 50);
  add("first_pr", stats.hasUnlockedAnyPr);
  add("streak_3", stats.currentDayStreak >= 3);
  add("streak_7", stats.currentDayStreak >= 7);
  add("streak_14", stats.currentDayStreak >= 14);
  add("goal_weekly", stats.hasAttainedWeeklyGoal);
  add("first_template", stats.totalTemplates >= 1);
  add("first_from_template", stats.hasUsedTemplate);
  add("cardio_km_10", stats.totalCardioKm >= 10);
  add("cardio_km_50", stats.totalCardioKm >= 50);
  add("strength_10", stats.totalStrengthSessions >= 10);
  return toUnlock;
}
