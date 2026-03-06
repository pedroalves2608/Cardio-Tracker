"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { UserGoals } from "@/lib/goals";

export default function GoalsPage() {
  const [goals, setGoals] = useState<UserGoals>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/goals", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : {}))
      .then(setGoals)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goals),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      setMessage("Metas salvas!");
    } catch {
      setMessage("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof UserGoals, value: number | undefined) => {
    setGoals((g) => ({ ...g, [key]: value }));
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-ink-500">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-14 z-10 bg-sand-50/95 backdrop-blur border-b border-sand-300/50 px-4 py-4">
        <div className="flex items-center gap-2 max-w-app mx-auto">
          <Link href="/workouts" className="text-ink-600 active:text-ink-900 text-sm font-medium">
            ← Voltar
          </Link>
        </div>
        <p className="text-sm text-ink-500 max-w-app mx-auto mt-1">Defina seus objetivos para a semana.</p>
      </header>
      <div className="p-4 max-w-app mx-auto w-full">
        <p className="text-sm text-ink-600 mb-4">
          Defina seus objetivos para a semana. O app mostra o progresso na tela de treinos.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cardioKm" className="block text-sm font-medium text-ink-700 mb-1">
              Meta de km (cardio) por semana
            </label>
            <input
              id="cardioKm"
              type="number"
              min={0}
              step={0.5}
              value={goals.cardioKmPerWeek ?? ""}
              onChange={(e) =>
                update("cardioKmPerWeek", e.target.value === "" ? undefined : Number(e.target.value))
              }
              className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 text-ink-900 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="cardioSessions" className="block text-sm font-medium text-ink-700 mb-1">
              Meta de treinos de cardio por semana
            </label>
            <input
              id="cardioSessions"
              type="number"
              min={0}
              step={1}
              value={goals.cardioSessionsPerWeek ?? ""}
              onChange={(e) =>
                update(
                  "cardioSessionsPerWeek",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 text-ink-900 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="strengthSessions" className="block text-sm font-medium text-ink-700 mb-1">
              Meta de treinos de força por semana
            </label>
            <input
              id="strengthSessions"
              type="number"
              min={0}
              step={1}
              value={goals.strengthSessionsPerWeek ?? ""}
              onChange={(e) =>
                update(
                  "strengthSessionsPerWeek",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 text-ink-900 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="workouts" className="block text-sm font-medium text-ink-700 mb-1">
              Meta total de treinos por semana (cardio + força)
            </label>
            <input
              id="workouts"
              type="number"
              min={0}
              step={1}
              value={goals.workoutsPerWeek ?? ""}
              onChange={(e) =>
                update("workoutsPerWeek", e.target.value === "" ? undefined : Number(e.target.value))
              }
              className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 text-ink-900 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          {message && (
            <p className={message.includes("Erro") ? "text-red-600 text-sm" : "text-green-600 text-sm"}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[2.75rem] rounded-xl bg-primary-600 text-white font-medium active:opacity-90 disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar metas"}
          </button>
        </form>
      </div>
    </div>
  );
}
