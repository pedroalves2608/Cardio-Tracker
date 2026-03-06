"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StrengthSessionForm } from "@/components/StrengthSessionForm";
import type { StrengthSession } from "@/lib/types";
import { getPostWorkoutMessage } from "@/lib/messages";

export default function EditStrengthPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [session, setSession] = useState<StrengthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/strength-sessions/${id}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(setSession)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (data: {
    date: string;
    notes: string | null;
    sets: { exerciseName: string; setNumber: number; reps: number; weightKg: number }[];
  }) => {
    const res = await fetch(`/api/strength-sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Erro ao salvar");
      throw new Error(j.error || "Erro ao salvar");
    }
    toast.success(getPostWorkoutMessage());
    router.push("/workouts");
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-ink-500">Carregando…</div>
    );
  }
  if (!session) {
    return (
      <div className="p-4 text-center text-ink-500">
        Treino não encontrado.
        <button
          type="button"
          onClick={() => router.push("/workouts")}
          className="block mt-2 text-primary-600"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <StrengthSessionForm
        initial={session}
        onSave={handleSave}
        onCancel={() => router.push("/workouts")}
      />
    </div>
  );
}
