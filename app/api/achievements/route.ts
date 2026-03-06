import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { apiError } from "@/lib/api-response";

const noStore = () => ({ "Cache-Control": "no-store, no-cache, must-revalidate" } as const);

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return apiError("Não autorizado", 401, { code: "UNAUTHORIZED" });
    const userId = session.userId === "env-fallback" ? null : session.userId;
    const unlocked =
      userId
        ? await prisma.userAchievement.findMany({
            where: { userId },
            select: { achievementSlug: true, unlockedAt: true },
          })
        : [];
    const bySlug = new Map(unlocked.map((u) => [u.achievementSlug, u.unlockedAt.toISOString().slice(0, 10)]));
    const list = ACHIEVEMENTS.map((a) => ({
      slug: a.slug,
      name: a.name,
      description: a.description,
      icon: a.icon,
      unlocked: bySlug.has(a.slug),
      unlockedAt: bySlug.get(a.slug) ?? null,
    }));
    return NextResponse.json(list, { headers: noStore() });
  } catch (error) {
    console.error("GET /api/achievements", error);
    return NextResponse.json({ error: "Falha ao carregar conquistas" }, { status: 500 });
  }
}
