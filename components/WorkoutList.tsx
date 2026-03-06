"use client";

import Link from "next/link";
import type { CardioSession } from "@/lib/types";
import { formatDuration, formatPace, paceSecondsPerKm, loadKgKm } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type WorkoutListProps = {
  workouts: CardioSession[];
  onDelete?: (id: string) => void;
  loading?: boolean;
};

export function WorkoutList({ workouts, onDelete, loading }: WorkoutListProps) {
  if (loading) {
    return (
      <div className="px-4 py-8 text-center text-ink-500 text-sm">
        Carregando treinos…
      </div>
    );
  }

  if (!workouts.length) {
    return (
      <div className="px-4 py-10 text-center text-ink-500">
        <p className="text-base font-medium text-ink-700">Nenhum treino cadastrado ainda.</p>
        <p className="mt-1.5 text-sm">Toque em Adicionar para registrar seu primeiro treino.</p>
      </div>
    );
  }

  return (
    <ul className="px-4 divide-y divide-sand-300/80">
      {workouts.map((w) => {
        const pace = paceSecondsPerKm(w.durationSeconds, w.distanceKm);
        return (
          <li key={w.id} className="py-4 first:pt-2 active:bg-sand-200/50 -mx-4 px-4 rounded-2xl transition-colors">
            <Link href={`/workouts/${w.id}/edit`} className="block">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-ink-900">
                    {format(new Date(w.date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  {(w.ankleWeight || (w.ankleWeightKg != null && w.ankleWeightKg > 0)) && (
                    <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
                      {w.ankleWeightKg != null && w.ankleWeightKg > 0
                        ? `${w.ankleWeightKg} kg`
                        : "Peso"}
                    </span>
                  )}
                </div>
                <span className="text-primary-600 text-sm font-medium">
                  {formatPace(pace)}/km
                </span>
              </div>
              <div className="flex gap-4 mt-1 text-sm text-ink-600">
                <span>{formatDuration(w.durationSeconds)}</span>
                <span>{w.distanceKm} km</span>
                {loadKgKm(w.distanceKm, w.ankleWeightKg) != null && (
                  <span title="Carga (distância × peso)">
                    {loadKgKm(w.distanceKm, w.ankleWeightKg)} kg·km
                  </span>
                )}
              </div>
              {w.notes && (
                <p className="mt-1 text-sm text-ink-500 truncate">{w.notes}</p>
              )}
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm("Excluir este treino?")) onDelete(w.id);
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
