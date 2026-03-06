"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StrengthTemplate } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<StrengthTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/strength-templates", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este template?")) return;
    const res = await fetch(`/api/strength-templates/${id}`, { method: "DELETE" });
    if (res.ok) setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-14 z-10 bg-sand-50/95 backdrop-blur border-b border-sand-300/50 px-4 py-4">
        <div className="flex justify-between items-center gap-2 max-w-app mx-auto">
          <span className="text-sm text-ink-500">Templates de treino</span>
          <Link
            href="/templates/new"
            className="h-11 px-5 rounded-2xl bg-primary-600 text-white font-medium flex items-center active:opacity-90"
          >
            Novo template
          </Link>
        </div>
      </header>
      <div className="p-4">
        {loading ? (
          <p className="text-center text-ink-500">Carregando…</p>
        ) : !templates.length ? (
          <EmptyState
            title="Nenhum template ainda"
            description="Crie um template para acelerar o registro dos treinos de força."
            primaryAction={{ label: "Novo template", href: "/templates/new" }}
          />
        ) : (
          <ul className="space-y-3">
            {templates.map((t) => (
              <li
                key={t.id}
                className="p-4 rounded-2xl border border-sand-300/60 bg-white shadow-card"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h2 className="font-semibold text-ink-900">{t.name}</h2>
                    <ul className="mt-2 text-sm text-ink-600">
                      {t.exercises.map((e) => (
                        <li key={e.id}>
                          {e.exerciseName}: {e.setsCount} séries
                          {(e.defaultReps != null || e.defaultWeightKg != null) &&
                            ` (${e.defaultReps ?? "—"} reps, ${e.defaultWeightKg ?? "—"} kg)`}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      href={`/workouts/strength/new?templateId=${t.id}`}
                      className="text-sm font-medium text-primary-600 active:underline"
                    >
                      Usar
                    </Link>
                    <Link
                      href={`/templates/${t.id}/edit`}
                      className="text-sm text-ink-600 active:underline"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="text-sm text-red-600 active:underline text-left"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
