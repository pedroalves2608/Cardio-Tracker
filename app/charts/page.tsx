"use client";

import { useEffect, useState } from "react";
import type { CardioSession } from "@/lib/types";
import { ChartsView } from "@/components/ChartsView";

export default function ChartsPage() {
  const [workouts, setWorkouts] = useState<CardioSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workouts")
      .then((res) => (res.ok ? res.json() : []))
      .then(setWorkouts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <header className="border-b border-slate-200 px-4 py-4 bg-white">
        <h1 className="text-xl font-bold text-slate-900 max-w-app mx-auto">
          Gráficos
        </h1>
      </header>
      <ChartsView workouts={workouts} loading={loading} />
    </div>
  );
}
