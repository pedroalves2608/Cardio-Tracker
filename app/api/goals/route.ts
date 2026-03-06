import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { parseGoalsJson, stringifyGoals, type UserGoals } from "@/lib/goals";
import { apiError } from "@/lib/api-response";

const noStore = () => ({ "Cache-Control": "no-store, no-cache, must-revalidate" } as const);

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return apiError("Não autorizado", 401, { code: "UNAUTHORIZED" });
    const userId = session.userId === "env-fallback" ? null : session.userId;
    if (!userId) {
      return NextResponse.json(parseGoalsJson(null), { headers: noStore() });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { goalsJson: true },
    });
    const goals = parseGoalsJson(user?.goalsJson ?? null);
    return NextResponse.json(goals, { headers: noStore() });
  } catch (error) {
    console.error("GET /api/goals", error);
    return NextResponse.json({ error: "Falha ao carregar metas" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return apiError("Não autorizado", 401, { code: "UNAUTHORIZED" });
    const userId = session.userId === "env-fallback" ? null : session.userId;
    if (!userId) return apiError("Usuário não identificado", 400, { code: "BAD_REQUEST" });
    const body = (await request.json()) as Record<string, unknown>;
    const goals: UserGoals = {
      cardioKmPerWeek: typeof body.cardioKmPerWeek === "number" ? body.cardioKmPerWeek : undefined,
      cardioSessionsPerWeek: typeof body.cardioSessionsPerWeek === "number" ? body.cardioSessionsPerWeek : undefined,
      strengthSessionsPerWeek: typeof body.strengthSessionsPerWeek === "number" ? body.strengthSessionsPerWeek : undefined,
      workoutsPerWeek: typeof body.workoutsPerWeek === "number" ? body.workoutsPerWeek : undefined,
    };
    await prisma.user.update({
      where: { id: userId },
      data: { goalsJson: stringifyGoals(goals) },
    });
    return NextResponse.json(goals, { headers: noStore() });
  } catch (error) {
    console.error("PUT /api/goals", error);
    return NextResponse.json({ error: "Falha ao salvar metas" }, { status: 500 });
  }
}
