"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

type CardioPR = {
  type: string;
  label: string;
  value: string;
  date: string;
  sessionId: string;
};

type StrengthPR = {
  exerciseName: string;
  maxWeightKg: number;
  reps: number;
  estimated1RM: number;
  date: string;
  sessionId: string;
};

export default function PRsPage() {
  const [cardio, setCardio] = useState<CardioPR[]>([]);
  const [strength, setStrength] = useState<StrengthPR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prs", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { cardio: [], strength: [] }))
      .then((data) => {
        setCardio(data.cardio ?? []);
        setStrength(data.strength ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center text-ink-500">Carregando seus recordes…</div>
    );
  }

  const hasAny = cardio.length > 0 || strength.length > 0;

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-14 z-10 bg-sand-50/95 backdrop-blur border-b border-sand-300/50 px-4 py-4">
        <p className="text-sm text-ink-500 max-w-app mx-auto">Seus recordes pessoais</p>
      </header>
      <div className="p-4 space-y-6 max-w-app mx-auto w-full">
        {!hasAny && (
          <EmptyState
            title="Nenhum recorde ainda"
            description="Registre treinos de cardio e força para ver seus PRs aqui."
            primaryAction={{ label: "Ir para treinos", href: "/workouts" }}
          />
        )}

        {cardio.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-ink-800 mb-3">Cardio</h2>
            <ul className="space-y-2">
              {cardio.map((pr) => (
                <li
                  key={`${pr.type}-${pr.sessionId}`}
                  className="flex justify-between items-center p-3 rounded-xl bg-white border border-sand-300/60"
                >
                  <div>
                    <span className="font-medium text-ink-900">{pr.label}</span>
                    <span className="block text-sm text-ink-500">{pr.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-primary-600">{pr.value}</span>
                    <Link
                      href={`/workouts/${pr.sessionId}/edit`}
                      className="block text-xs text-ink-500 hover:underline"
                    >
                      Ver treino
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {strength.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-ink-800 mb-3">Força</h2>
            <ul className="space-y-2">
              {strength.map((pr) => (
                <li
                  key={`${pr.exerciseName}-${pr.sessionId}`}
                  className="flex justify-between items-center p-3 rounded-xl bg-white border border-sand-300/60"
                >
                  <div>
                    <span className="font-medium text-ink-900">{pr.exerciseName}</span>
                    <span className="block text-sm text-ink-500">{pr.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-primary-600">
                      {pr.maxWeightKg} kg × {pr.reps} reps
                    </span>
                    <span className="block text-xs text-ink-500">
                      1RM est. {pr.estimated1RM} kg
                    </span>
                    <Link
                      href={`/workouts/strength/${pr.sessionId}/edit`}
                      className="block text-xs text-ink-500 hover:underline"
                    >
                      Ver treino
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
