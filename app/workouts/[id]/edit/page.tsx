"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CardioSession } from "@/lib/types";
import { WorkoutForm } from "@/components/WorkoutForm";
import { getPostWorkoutMessage } from "@/lib/messages";

export default function EditWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [workout, setWorkout] = useState<CardioSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workouts/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setWorkout(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (data: {
    date: string;
    durationSeconds: number;
    distanceKm: number;
    ankleWeight: boolean;
    ankleWeightKg: number | null;
    notes: string | null;
  }) => {
    const res = await fetch(`/api/workouts/${id}`, {
      method: "PUT",
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
      toast.error(msg);
      throw new Error(msg);
    }
    toast.success(getPostWorkoutMessage());
    router.push("/workouts");
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-ink-500">Carregando…</div>
    );
  }

  if (!workout) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink-600">Treino não encontrado.</p>
        <button
          type="button"
          onClick={() => router.push("/workouts")}
          className="mt-4 text-primary-600 font-medium"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <WorkoutForm
        initial={workout}
        onSave={handleSave}
        onCancel={() => router.push("/workouts")}
      />
    </div>
  );
}
