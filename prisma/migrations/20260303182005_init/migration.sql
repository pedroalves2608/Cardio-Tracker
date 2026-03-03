-- CreateTable
CREATE TABLE "CardioSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "distanceKm" REAL NOT NULL,
    "ankleWeight" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
