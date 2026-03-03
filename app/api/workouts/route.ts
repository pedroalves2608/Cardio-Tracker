import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWorkoutSchema } from "@/lib/validation";

export async function GET() {
  try {
    const sessions = await prisma.cardioSession.findMany({
      orderBy: { date: "desc" },
    });
    const data = sessions.map((s) => ({
      ...s,
      date: s.date.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/workouts", error);
    return NextResponse.json(
      { error: "Falha ao listar treinos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createWorkoutSchema.safeParse({
      ...body,
      date: body.date ?? new Date().toISOString(),
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const firstField = flat.fieldErrors as Record<string, string[] | undefined>;
      const firstMessage =
        Object.values(firstField).flat().find(Boolean) ?? flat.formErrors[0] ?? "Dados inválidos";
      return NextResponse.json(
        { error: firstMessage, details: flat },
        { status: 400 }
      );
    }
    const { date, durationSeconds, distanceKm, ankleWeight, ankleWeightKg, notes } = parsed.data;
    const weightKg =
      ankleWeightKg != null && Number(ankleWeightKg) > 0 ? Number(ankleWeightKg) : null;
    const session = await prisma.cardioSession.create({
      data: {
        date: new Date(date),
        durationSeconds: Number(durationSeconds),
        distanceKm: Number(distanceKm),
        ankleWeight: Boolean(ankleWeight),
        ankleWeightKg: weightKg,
        notes: notes ?? null,
      },
    });
    return NextResponse.json({
      id: session.id,
      date: session.date.toISOString(),
      durationSeconds: session.durationSeconds,
      distanceKm: session.distanceKm,
      ankleWeight: session.ankleWeight,
      ankleWeightKg: session.ankleWeightKg,
      notes: session.notes,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("POST /api/workouts", message, error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? `Falha ao criar treino: ${message}`
            : "Falha ao criar treino",
      },
      { status: 500 }
    );
  }
}
