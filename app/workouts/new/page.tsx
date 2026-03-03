"use client";

import { useRouter } from "next/navigation";
import { WorkoutForm } from "@/components/WorkoutForm";

export default function NewWorkoutPage() {
  const router = useRouter();

  const handleSave = async (data: {
    date: string;
    durationSeconds: number;
    distanceKm: number;
    ankleWeight: boolean;
    ankleWeightKg: number | null;
    notes: string | null;
  }) => {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      let msg = "Erro ao salvar";
      try {
        const j = JSON.parse(text);
        msg = j.error || msg;
      } catch {
        if (text) msg = text.slice(0, 200);
      }
      throw new Error(msg);
    }
    router.push("/workouts");
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="border-b border-slate-200 px-4 py-4 bg-white">
        <h1 className="text-xl font-bold text-slate-900 max-w-app mx-auto">
          Novo treino
        </h1>
      </header>
      <WorkoutForm onSave={handleSave} onCancel={() => router.push("/workouts")} />
    </div>
  );
}
