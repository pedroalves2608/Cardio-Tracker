"use client";

import { useEffect, useState } from "react";
import type { CardioSession, StrengthSession } from "@/lib/types";
import { ChartsView } from "@/components/ChartsView";
import { UserGreeting } from "@/components/UserGreeting";

export default function ChartsPage() {
  const [workouts, setWorkouts] = useState<CardioSession[]>([]);
  const [strengthSessions, setStrengthSessions] = useState<StrengthSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/workouts").then((res) => (res.ok ? res.json() : [])),
      fetch("/api/strength-sessions").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([cardio, strength]) => {
        setWorkouts(cardio);
        setStrengthSessions(strength);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-14 z-10 bg-sand-50/95 backdrop-blur border-b border-sand-300/50 px-4 py-3">
        <div className="max-w-app mx-auto flex flex-col gap-0.5">
          <UserGreeting />
          <p className="text-sm text-ink-500">Seus dados em gráficos</p>
        </div>
      </header>
      <ChartsView workouts={workouts} strengthSessions={strengthSessions} loading={loading} />
    </div>
  );
}
