"use client";

import Link from "next/link";
import type { WeekStats } from "@/lib/types";
import { formatPace } from "@/lib/utils";
import { getRestDaySuggestion } from "@/lib/messages";

type WeeklySummaryProps = {
  stats: WeekStats | null;
  loading?: boolean;
};

export function WeeklySummary({ stats, loading }: WeeklySummaryProps) {
  if (loading) {
    return (
      <section className="mx-4 mt-4 p-4 rounded-2xl bg-sand-100 border border-sand-300/60 animate-pulse">
        <div className="h-4 w-24 bg-sand-300 rounded-full mb-3" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-sand-200 rounded-xl" />
          <div className="h-16 bg-sand-200 rounded-xl" />
        </div>
      </section>
    );
  }

  if (!stats) return null;

  const { cardio, strength, goals, progress, streak } = stats;
  const anyGoalSet =
    (goals.cardioKmPerWeek ?? 0) > 0 ||
    (goals.cardioSessionsPerWeek ?? 0) > 0 ||
    (goals.strengthSessionsPerWeek ?? 0) > 0 ||
    (goals.workoutsPerWeek ?? 0) > 0;

  return (
    <section className="mx-4 mt-4 p-4 rounded-2xl bg-white border border-sand-300/60 shadow-card">
      <h2 className="text-sm font-medium text-ink-500 mb-3">Esta semana</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="text-center p-3 rounded-xl bg-sand-100">
          <p className="text-xl font-semibold text-primary-600">{cardio.sessions}</p>
          <p className="text-xs text-ink-500">Cardio</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-sand-100">
          <p className="text-xl font-semibold text-ink-900">{cardio.totalKm.toFixed(1)}</p>
          <p className="text-xs text-ink-500">km</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-sand-100">
          <p className="text-xl font-semibold text-ink-900">{formatPace(cardio.avgPaceSecondsPerKm)}</p>
          <p className="text-xs text-ink-500">pace</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-sand-100">
          <p className="text-xl font-semibold text-ink-900">{strength.sessions}</p>
          <p className="text-xs text-ink-500">Força</p>
        </div>
      </div>

      {streak.currentDayStreak > 0 && (
        <div className="flex items-center gap-2 mb-3 text-primary-800 bg-primary-50 rounded-xl px-3 py-2">
          <span className="text-lg" aria-hidden>🔥</span>
          <span className="text-sm font-medium">
            {streak.currentDayStreak} {streak.currentDayStreak === 1 ? "dia" : "dias"} seguidos
          </span>
        </div>
      )}
      {streak.currentWeekStreak > 0 && streak.currentDayStreak === 0 && (
        <div className="flex items-center gap-2 mb-3 text-ink-600 bg-sand-100 rounded-xl px-3 py-2">
          <span className="text-sm font-medium">
            {streak.currentWeekStreak} {streak.currentWeekStreak === 1 ? "semana" : "semanas"} com treino
          </span>
        </div>
      )}

      {streak.currentDayStreak >= 5 && (
        <div className="flex items-center gap-2 mb-3 text-primary-800 bg-primary-50 rounded-xl px-3 py-2">
          <span className="text-sm">{getRestDaySuggestion()}</span>
        </div>
      )}

      {anyGoalSet && (
        <div className="space-y-2 pt-2 border-t border-sand-300/60">
          {goals.cardioKmPerWeek != null && goals.cardioKmPerWeek > 0 && (
            <div>
              <div className="flex justify-between text-xs text-ink-600 mb-0.5">
                <span>Meta cardio (km)</span>
                <span>
                  {progress.cardioKm.current.toFixed(1)} / {progress.cardioKm.target}
                  {progress.cardioKm.attained && " ✓"}
                </span>
              </div>
              <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    progress.cardioKm.attained ? "bg-primary-500" : "bg-primary-400"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (progress.cardioKm.current / progress.cardioKm.target) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
          {goals.workoutsPerWeek != null && goals.workoutsPerWeek > 0 && (
            <div>
              <div className="flex justify-between text-xs text-ink-600 mb-0.5">
                <span>Meta treinos</span>
                <span>
                  {progress.workouts.current} / {progress.workouts.target}
                  {progress.workouts.attained && " ✓"}
                </span>
              </div>
              <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    progress.workouts.attained ? "bg-primary-500" : "bg-primary-400"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (progress.workouts.current / progress.workouts.target) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
          {goals.strengthSessionsPerWeek != null && goals.strengthSessionsPerWeek > 0 && (
            <div>
              <div className="flex justify-between text-xs text-ink-600 mb-0.5">
                <span>Meta força</span>
                <span>
                  {progress.strengthSessions.current} / {progress.strengthSessions.target}
                  {progress.strengthSessions.attained && " ✓"}
                </span>
              </div>
              <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    progress.strengthSessions.attained ? "bg-primary-500" : "bg-primary-400"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      progress.strengthSessions.target > 0
                        ? (progress.strengthSessions.current / progress.strengthSessions.target) * 100
                        : 0
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {anyGoalSet && (
        <Link
          href="/goals"
          className="block mt-3 text-sm text-primary-600 font-medium active:underline"
        >
          Ajustar metas
        </Link>
      )}
    </section>
  );
}
