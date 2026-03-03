import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const today = new Date();
  const sessions = [];

  const distances = [2, 2.5, 3, 3.2, 4, 5, 5.5, 6, 7, 8, 10, 10.5];
  const durationRanges: [number, number][] = [
    [600, 900],
    [900, 1200],
    [1200, 1800],
    [1500, 2400],
  ];

  for (let i = 0; i < 15; i++) {
    const daysAgo = randomInt(0, 90);
    const date = subDays(today, daysAgo);
    const dist = distances[randomInt(0, distances.length - 1)];
    const [minSec, maxSec] = durationRanges[randomInt(0, durationRanges.length - 1)];
    const durationSeconds = Math.round(randomBetween(minSec, maxSec));
    const ankleWeight = Math.random() > 0.6;
    const weights = [0.5, 1, 1.5, 2];
    const ankleWeightKg = ankleWeight ? weights[randomInt(0, weights.length - 1)] : null;

    sessions.push({
      date,
      durationSeconds,
      distanceKm: dist,
      ankleWeight,
      ankleWeightKg,
      notes: i % 3 === 0 ? `Treino ${i + 1} - bom ritmo` : null,
    });
  }

  await prisma.cardioSession.createMany({ data: sessions });
  console.log(`Seed: ${sessions.length} treinos criados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
