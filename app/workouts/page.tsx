"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CardioSession, StrengthSession, WeekStats } from "@/lib/types";
import { WorkoutList } from "@/components/WorkoutList";
import { StrengthList } from "@/components/StrengthList";
import { WeeklySummary } from "@/components/WeeklySummary";
import { UserGreeting } from "@/components/UserGreeting";
import { EmptyState } from "@/components/EmptyState";

type Tab = "cardio" | "strength";

export default function WorkoutsPage() {
  const [tab, setTab] = useState<Tab>("cardio");
  const [workouts, setWorkouts] = useState<CardioSession[]>([]);
  const [strengthSessions, setStrengthSessions] = useState<StrengthSession[]>([]);
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [strengthLoading, setStrengthLoading] = useState(true);
  const [weekStatsLoading, setWeekStatsLoading] = useState(true);

  const fetchWorkouts = async () => {
    try {
      const res = await fetch("/api/workouts", { cache: "no-store" });
      if (res.ok) setWorkouts(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fetchStrength = async () => {
    try {
      const res = await fetch("/api/strength-sessions", { cache: "no-store" });
      if (res.ok) setStrengthSessions(await res.json());
    } finally {
      setStrengthLoading(false);
    }
  };

  const fetchWeekStats = async () => {
    try {
      const res = await fetch("/api/stats/week", { cache: "no-store" });
      if (res.ok) setWeekStats(await res.json());
    } finally {
      setWeekStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    fetchStrength();
  }, []);

  useEffect(() => {
    fetchWeekStats();
  }, []);

  const handleDeleteCardio = async (id: string) => {
    const res = await fetch(`/api/workouts/${id}`, { method: "DELETE", cache: "no-store" });
    if (res.ok) {
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      await fetchWorkouts();
      await fetchWeekStats();
    }
  };

  const handleDeleteStrength = async (id: string) => {
    const res = await fetch(`/api/strength-sessions/${id}`, { method: "DELETE", cache: "no-store" });
    if (res.ok) {
      setStrengthSessions((prev) => prev.filter((s) => s.id !== id));
      await fetchStrength();
      await fetchWeekStats();
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-14 z-10 bg-sand-50/95 backdrop-blur border-b border-sand-300/50 px-4 py-3">
        <div className="flex justify-between items-center gap-3">
          <UserGreeting />
          {tab === "cardio" ? (
            <Link
              href="/workouts/new"
              className="touch-target h-11 px-5 rounded-2xl bg-primary-600 text-white font-medium flex items-center justify-center active:opacity-90"
            >
              Adicionar cardio
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/templates"
                className="touch-target h-11 px-4 rounded-2xl border border-sand-400 font-medium text-ink-700 bg-white flex items-center justify-center active:bg-sand-200"
              >
                Templates
              </Link>
              <Link
                href="/workouts/strength/new"
                className="touch-target h-11 px-5 rounded-2xl bg-primary-600 text-white font-medium flex items-center justify-center active:opacity-90"
              >
                Novo treino
              </Link>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => setTab("cardio")}
            className={`flex-1 py-3 rounded-2xl text-sm font-medium touch-target flex items-center justify-center ${
              tab === "cardio" ? "bg-primary-600 text-white" : "bg-sand-200 text-ink-600"
            }`}
          >
            Cardio
          </button>
          <button
            type="button"
            onClick={() => setTab("strength")}
            className={`flex-1 py-3 rounded-2xl text-sm font-medium touch-target flex items-center justify-center ${
              tab === "strength" ? "bg-primary-600 text-white" : "bg-sand-200 text-ink-600"
            }`}
          >
            Força
          </button>
        </div>
      </header>
      <WeeklySummary stats={weekStats} loading={weekStatsLoading} />
      {!loading && !strengthLoading && workouts.length === 0 && strengthSessions.length === 0 && (
        <EmptyState
          title="Nenhum treino ainda"
          description="Registre seu primeiro treino para acompanhar seu progresso e ver gráficos e PRs."
          primaryAction={{ label: "Adicionar cardio", href: "/workouts/new" }}
          secondaryAction={{ label: "Novo treino de força", href: "/workouts/strength/new" }}
        />
      )}
      {tab === "cardio" && (
        <WorkoutList
          workouts={workouts}
          onDelete={handleDeleteCardio}
          loading={loading}
        />
      )}
      {tab === "strength" && (
        <StrengthList
          sessions={strengthSessions}
          onDelete={handleDeleteStrength}
          loading={strengthLoading}
        />
      )}
    </div>
  );
}
