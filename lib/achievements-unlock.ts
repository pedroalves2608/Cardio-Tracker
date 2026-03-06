import type { PrismaClient } from "@prisma/client";
import { getWorkoutDates, currentDayStreak } from "@/lib/streak";
import {
  ACHIEVEMENTS,
  getAchievementsToUnlock,
  type StatsForAchievements,
} from "@/lib/achievements";

export async function checkAndUnlockAchievements(
  prisma: PrismaClient,
  userId: string,
  options: {
    newPrThisSession?: boolean;
    goalAttainedThisSession?: boolean;
  } = {}
): Promise<{ newlyUnlocked: { slug: string; name: string }[] }> {
  const [cardioSessions, strengthSessions, user, templates, unlocked] = await Promise.all([
    prisma.cardioSession.findMany({
      where: { userId },
      select: { date: true, distanceKm: true },
    }),
    prisma.strengthSession.findMany({
      where: { userId },
      select: { date: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { weeklyGoalAttainedAt: true, usedTemplateAt: true },
    }),
    prisma.strengthTemplate.count({ where: { userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementSlug: true },
    }),
  ]);

  const workoutDates = getWorkoutDates(
    cardioSessions.map((s) => new Date(s.date)),
    strengthSessions.map((s) => new Date(s.date))
  );
  const dayStreak = currentDayStreak(workoutDates);

  const totalCardioKm = cardioSessions.reduce((a, w) => a + w.distanceKm, 0);
  const stats: StatsForAchievements = {
    totalWorkouts: cardioSessions.length + strengthSessions.length,
    totalCardioKm,
    totalStrengthSessions: strengthSessions.length,
    currentDayStreak: dayStreak,
    hasUnlockedAnyPr: options.newPrThisSession ?? false,
    hasAttainedWeeklyGoal: !!user?.weeklyGoalAttainedAt || (options.goalAttainedThisSession ?? false),
    totalTemplates: templates,
    hasUsedTemplate: !!user?.usedTemplateAt,
  };

  const alreadySet = new Set(unlocked.map((u) => u.achievementSlug));
  const toUnlock = getAchievementsToUnlock(stats, alreadySet);
  const newlyUnlocked: { slug: string; name: string }[] = [];

  for (const slug of toUnlock) {
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementSlug: { userId, achievementSlug: slug },
      },
      create: { userId, achievementSlug: slug },
      update: {},
    });
    const def = ACHIEVEMENTS.find((a) => a.slug === slug);
    if (def) newlyUnlocked.push({ slug: def.slug, name: def.name });
  }

  return { newlyUnlocked };
}
