"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CardioSession } from "@/lib/types";
import { WorkoutList } from "@/components/WorkoutList";
import { StatsSummary } from "@/components/StatsSummary";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<CardioSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    try {
      const res = await fetch("/api/workouts");
      if (res.ok) {
        const data = await res.json();
        setWorkouts(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    if (res.ok) setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 py-4">
        <div className="flex justify-between items-center max-w-app mx-auto">
          <h1 className="text-xl font-bold text-slate-900">Treinos</h1>
          <Link
            href="/workouts/new"
            className="h-11 px-5 rounded-xl bg-primary-600 text-white font-medium flex items-center"
          >
            Adicionar treino
          </Link>
        </div>
      </header>
      <StatsSummary workouts={workouts} />
      <WorkoutList
        workouts={workouts}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}
