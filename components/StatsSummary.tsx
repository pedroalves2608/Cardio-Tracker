"use client";

import type { CardioSession } from "@/lib/types";
import { formatPace, paceSecondsPerKm } from "@/lib/utils";
import { startOfWeek, isWithinInterval } from "date-fns";

type StatsSummaryProps = {
  workouts: CardioSession[];
};

export function StatsSummary({ workouts }: StatsSummaryProps) {
  if (!workouts.length) return null;

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekSessions = workouts.filter((w) =>
    isWithinInterval(new Date(w.date), { start: weekStart, end: now })
  );
  const totalKmWeek = weekSessions.reduce((s, w) => s + w.distanceKm, 0);
  const totalSecWeek = weekSessions.reduce((s, w) => s + w.durationSeconds, 0);
  const avgPaceWeek =
    totalKmWeek > 0 ? paceSecondsPerKm(totalSecWeek, totalKmWeek) : null;

  return (
    <section className="mx-4 mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <h2 className="text-sm font-medium text-slate-500 mb-3">Esta semana</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-primary-600">{weekSessions.length}</p>
          <p className="text-xs text-slate-500">Treinos</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{totalKmWeek.toFixed(1)}</p>
          <p className="text-xs text-slate-500">km</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">
            {formatPace(avgPaceWeek)}
          </p>
          <p className="text-xs text-slate-500">pace médio</p>
        </div>
      </div>
    </section>
  );
}
