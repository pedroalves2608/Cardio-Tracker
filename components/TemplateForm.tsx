"use client";

import { useState, useCallback } from "react";
import type { StrengthTemplate } from "@/lib/types";

export type TemplateExerciseRow = {
  id: string;
  exerciseName: string;
  order: number;
  setsCount: number;
  defaultReps: number | null;
  defaultWeightKg: number | null;
};

type TemplateFormProps = {
  initial?: Partial<StrengthTemplate> | null;
  onSave: (data: {
    name: string;
    exercises: { exerciseName: string; order: number; setsCount: number; defaultReps: number | null; defaultWeightKg: number | null }[];
  }) => Promise<void>;
  onCancel: () => void;
};

export function TemplateForm({ initial, onSave, onCancel }: TemplateFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [rows, setRows] = useState<TemplateExerciseRow[]>(() => {
    if (initial?.exercises?.length) {
      return initial.exercises.map((e, i) => ({
        id: e.id || `i-${i}`,
        exerciseName: e.exerciseName,
        order: e.order ?? i,
        setsCount: e.setsCount,
        defaultReps: e.defaultReps ?? null,
        defaultWeightKg: e.defaultWeightKg ?? null,
      }));
    }
    return [{ id: "1", exerciseName: "", order: 0, setsCount: 3, defaultReps: 10, defaultWeightKg: null }];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const addRow = useCallback(() => {
    setRows((r) => [
      ...r,
      {
        id: `new-${Date.now()}`,
        exerciseName: "",
        order: r.length,
        setsCount: 3,
        defaultReps: 10,
        defaultWeightKg: null,
      },
    ]);
  }, []);

  const updateRow = useCallback((id: string, field: keyof TemplateExerciseRow, value: string | number | null) => {
    setRows((r) =>
      r.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((r) => r.filter((row) => row.id !== id));
  }, []);

  const buildExercises = useCallback(() => {
    return rows
      .filter((r) => r.exerciseName.trim())
      .map((r, i) => ({
        exerciseName: r.exerciseName.trim(),
        order: i,
        setsCount: r.setsCount,
        defaultReps: r.defaultReps,
        defaultWeightKg: r.defaultWeightKg,
      }));
  }, [rows]);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nome do template é obrigatório.";
    const exercises = buildExercises();
    if (exercises.length === 0) e.exercises = "Adicione pelo menos um exercício.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, buildExercises]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const exercises = buildExercises();
    setSaving(true);
    try {
      await onSave({ name: name.trim(), exercises });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Não foi possível salvar." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-app mx-auto">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1">
          Nome do template
        </label>
        <input
          id="name"
          type="text"
          placeholder="Ex: Treino A - Peito e tríceps"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-ink-700">Exercícios (séries, reps e carga padrão)</label>
          <button type="button" onClick={addRow} className="text-sm font-medium text-primary-600 hover:underline">
            + Exercício
          </button>
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-sand-50 border border-sand-300/60">
              <input
                type="text"
                placeholder="Nome do exercício"
                value={row.exerciseName}
                onChange={(e) => updateRow(row.id, "exerciseName", e.target.value)}
                className="flex-1 min-w-[120px] h-10 px-3 rounded-lg border border-sand-400 text-sm"
              />
              <input
                type="number"
                min={1}
                placeholder="Séries"
                value={row.setsCount || ""}
                onChange={(e) => updateRow(row.id, "setsCount", parseInt(e.target.value, 10) || 1)}
                className="w-14 h-10 px-2 rounded-lg border border-sand-400 text-sm text-center"
              />
              <input
                type="number"
                min={0}
                placeholder="Reps"
                value={row.defaultReps ?? ""}
                onChange={(e) => updateRow(row.id, "defaultReps", e.target.value === "" ? null : parseInt(e.target.value, 10))}
                className="w-14 h-10 px-2 rounded-lg border border-sand-400 text-sm text-center"
              />
              <input
                type="number"
                min={0}
                step={0.5}
                placeholder="kg"
                value={row.defaultWeightKg ?? ""}
                onChange={(e) => updateRow(row.id, "defaultWeightKg", e.target.value === "" ? null : parseFloat(e.target.value))}
                className="w-14 h-10 px-2 rounded-lg border border-sand-400 text-sm text-center"
              />
              <button type="button" onClick={() => removeRow(row.id)} className="text-red-600 hover:underline text-sm">
                Remover
              </button>
            </div>
          ))}
        </div>
        {errors.exercises && <p className="mt-1 text-sm text-red-600">{errors.exercises}</p>}
      </div>

      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl border border-sand-400 font-medium text-ink-700 bg-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 h-12 rounded-xl bg-primary-600 font-medium text-white active:opacity-90 disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
