-- AlterTable User: add goalsJson, weeklyGoalAttainedAt, usedTemplateAt
ALTER TABLE "User" ADD COLUMN "goalsJson" TEXT;
ALTER TABLE "User" ADD COLUMN "weeklyGoalAttainedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "usedTemplateAt" DATETIME;

-- CreateTable UserAchievement
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "achievementSlug" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserAchievement_userId_achievementSlug_key" ON "UserAchievement"("userId", "achievementSlug");
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");
