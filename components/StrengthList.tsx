"use client";

import Link from "next/link";
import type { StrengthSession } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type StrengthListProps = {
  sessions: StrengthSession[];
  onDelete?: (id: string) => void;
  loading?: boolean;
};

export function StrengthList({ sessions, onDelete, loading }: StrengthListProps) {
  if (loading) {
    return (
      <div className="p-4 text-center text-ink-500 text-sm">Carregando treinos de força…</div>
    );
  }
  if (!sessions.length) {
    return (
      <div className="p-8 text-center text-ink-500">
        <p className="text-base font-medium text-ink-700">Nenhum treino de força ainda.</p>
        <p className="mt-1.5 text-sm">Adicione um treino ou use um template.</p>
      </div>
    );
  }

  return (
    <ul className="px-4 divide-y divide-sand-300/80">
      {sessions.map((s) => {
        const byExercise = s.sets.reduce((acc, set) => {
          const name = set.exerciseName;
          if (!acc[name]) acc[name] = [];
          acc[name].push(set);
          return acc;
        }, {} as Record<string, typeof s.sets>);
        return (
          <li key={s.id} className="py-4 first:pt-2 active:bg-sand-200/50 -mx-4 px-4 rounded-2xl transition-colors">
            <Link href={`/workouts/strength/${s.id}/edit`} className="block">
              <div className="flex justify-between items-start">
                <span className="font-medium text-ink-900">
                  {format(new Date(s.date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="mt-1 text-sm text-ink-600">
                {Object.entries(byExercise).map(([name, sets]) => {
                  const summary = sets.map((x) => `${x.reps}x${x.weightKg}kg`).join(", ");
                  return (
                    <div key={name}>
                      <span className="font-medium text-ink-700">{name}:</span> {summary}
                    </div>
                  );
                })}
              </div>
              {s.notes && (
                <p className="mt-1 text-sm text-ink-500 truncate">{s.notes}</p>
              )}
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm("Excluir este treino?")) onDelete(s.id);
                }}
                className="mt-2 text-sm text-red-600 active:underline"
              >
                Excluir
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
