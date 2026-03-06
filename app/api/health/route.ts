import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const body: { ok: boolean; db?: string } = { ok: true };
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);
    body.db = "ok";
  } catch {
    // App is still up; DB might be temporarily unavailable
  }
  return NextResponse.json(body);
}
