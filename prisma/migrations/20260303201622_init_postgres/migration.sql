-- CreateTable
CREATE TABLE "CardioSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "ankleWeight" BOOLEAN NOT NULL DEFAULT false,
    "ankleWeightKg" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardioSession_pkey" PRIMARY KEY ("id")
);
