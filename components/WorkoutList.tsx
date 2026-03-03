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
      <div className="p-4 text-center text-slate-500">
        Carregando treinos…
      </div>
    );
  }

  if (!workouts.length) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-lg">Nenhum treino cadastrado ainda.</p>
        <p className="mt-2 text-sm">Toque em Adicionar para registrar seu primeiro treino.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-200">
      {workouts.map((w) => {
        const pace = paceSecondsPerKm(w.durationSeconds, w.distanceKm);
        return (
          <li key={w.id} className="px-4 py-3 hover:bg-slate-50">
            <Link href={`/workouts/${w.id}/edit`} className="block">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-slate-900">
                    {format(new Date(w.date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  {(w.ankleWeight || (w.ankleWeightKg != null && w.ankleWeightKg > 0)) && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
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
              <div className="flex gap-4 mt-1 text-sm text-slate-600">
                <span>{formatDuration(w.durationSeconds)}</span>
                <span>{w.distanceKm} km</span>
                {loadKgKm(w.distanceKm, w.ankleWeightKg) != null && (
                  <span title="Carga (distância × peso)">
                    {loadKgKm(w.distanceKm, w.ankleWeightKg)} kg·km
                  </span>
                )}
              </div>
              {w.notes && (
                <p className="mt-1 text-sm text-slate-500 truncate">{w.notes}</p>
              )}
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm("Excluir este treino?")) onDelete(w.id);
                }}
                className="mt-2 text-sm text-red-600 hover:underline"
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
