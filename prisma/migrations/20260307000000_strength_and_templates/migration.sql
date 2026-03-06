-- CreateTable StrengthSession
CREATE TABLE "StrengthSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StrengthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable StrengthSet
CREATE TABLE "StrengthSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weightKg" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StrengthSet_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StrengthSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable StrengthTemplate
CREATE TABLE "StrengthTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StrengthTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable StrengthTemplateExercise
CREATE TABLE "StrengthTemplateExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "setsCount" INTEGER NOT NULL,
    "defaultReps" INTEGER,
    "defaultWeightKg" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StrengthTemplateExercise_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StrengthTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "StrengthSession_userId_idx" ON "StrengthSession"("userId");
CREATE INDEX "StrengthSet_sessionId_idx" ON "StrengthSet"("sessionId");
CREATE INDEX "StrengthTemplate_userId_idx" ON "StrengthTemplate"("userId");
CREATE INDEX "StrengthTemplateExercise_templateId_idx" ON "StrengthTemplateExercise"("templateId");
