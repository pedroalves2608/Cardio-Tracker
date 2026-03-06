"use client";

import { useState, useCallback } from "react";
import type { StrengthSession, StrengthSet } from "@/lib/types";

function toDateBR(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

function parseDateBR(str: string): Date {
  const trimmed = str.trim().replace(/\s/g, "");
  const parts = trimmed.split("/");
  if (parts.length !== 3) return new Date(NaN);
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return new Date(NaN);
  const d = new Date(year, month, day);
  if (d.getDate() !== day || d.getMonth() !== month || d.getFullYear() !== year) return new Date(NaN);
  return d;
}

export type SetRow = { id: string; exerciseName: string; setNumber: number; reps: number; weightKg: number };

type StrengthSessionFormProps = {
  initial?: Partial<StrengthSession> | null;
  onSave: (data: { date: string; notes: string | null; sets: { exerciseName: string; setNumber: number; reps: number; weightKg: number }[] }) => Promise<void>;
  onCancel: () => void;
};

export function StrengthSessionForm({ initial, onSave, onCancel }: StrengthSessionFormProps) {
  const [date, setDate] = useState(
    initial?.date ? toDateBR(initial.date) : toDateBR(new Date().toISOString())
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [rows, setRows] = useState<SetRow[]>(() => {
    if (initial?.sets?.length) {
      return initial.sets.map((s, i) => ({
        id: s.id || `i-${i}`,
        exerciseName: s.exerciseName,
        setNumber: s.setNumber,
        reps: s.reps,
        weightKg: s.weightKg,
      }));
    }
    return [{ id: "1", exerciseName: "", setNumber: 1, reps: 0, weightKg: 0 }];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const addRow = useCallback(() => {
    const nextSet = rows.length + 1;
    setRows((r) => [...r, { id: `new-${Date.now()}`, exerciseName: "", setNumber: nextSet, reps: 0, weightKg: 0 }]);
  }, [rows.length]);

  const updateRow = useCallback((id: string, field: keyof SetRow, value: string | number) => {
    setRows((r) =>
      r.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((r) => {
      const next = r.filter((row) => row.id !== id);
      return next.map((row, i) => ({ ...row, setNumber: i + 1 }));
    });
  }, []);

  // Agrupa por exerciseName e gera sets com setNumber 1,2,3...
  const buildSets = useCallback((): { exerciseName: string; setNumber: number; reps: number; weightKg: number }[] => {
    const byExercise = new Map<string, { reps: number; weightKg: number }[]>();
    for (const row of rows) {
      const name = row.exerciseName.trim();
      if (!name) continue;
      if (!byExercise.has(name)) byExercise.set(name, []);
      byExercise.get(name)!.push({ reps: row.reps, weightKg: row.weightKg });
    }
    const out: { exerciseName: string; setNumber: number; reps: number; weightKg: number }[] = [];
    for (const [exerciseName, sets] of Array.from(byExercise.entries())) {
      sets.forEach((s, i) => {
        out.push({ exerciseName, setNumber: i + 1, reps: s.reps, weightKg: s.weightKg });
      });
    }
    return out;
  }, [rows]);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!date.trim()) e.date = "Informe a data (DD/MM/AAAA).";
    else {
      const parsed = parseDateBR(date);
      if (isNaN(parsed.getTime())) e.date = "Data inválida.";
    }
    const sets = buildSets();
    if (sets.length === 0) e.sets = "Adicione pelo menos um exercício com séries.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [date, buildSets]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const sets = buildSets();
    if (sets.length === 0) {
      setErrors({ sets: "Adicione pelo menos uma série." });
      return;
    }
    setSaving(true);
    try {
      const dateObj = parseDateBR(date);
      await onSave({
        date: dateObj.toISOString(),
        notes: notes.trim() || null,
        sets,
      });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Não foi possível salvar." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-app mx-auto">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-ink-700 mb-1">
          Data (DD/MM/AAAA)
        </label>
        <input
          id="date"
          type="text"
          inputMode="numeric"
          placeholder="03/03/2026"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          maxLength={10}
          className="w-full h-12 px-4 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-ink-700">Séries (exercício, reps, carga kg)</label>
          <button
            type="button"
            onClick={addRow}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            + Série
          </button>
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-sand-50 border border-sand-300/60">
              <input
                type="text"
                placeholder="Ex: Supino"
                value={row.exerciseName}
                onChange={(e) => updateRow(row.id, "exerciseName", e.target.value)}
                className="flex-1 min-w-[100px] h-10 px-3 rounded-lg border border-sand-400 text-sm"
              />
              <input
                type="number"
                min={0}
                placeholder="Reps"
                value={row.reps || ""}
                onChange={(e) => updateRow(row.id, "reps", parseInt(e.target.value, 10) || 0)}
                className="w-16 h-10 px-2 rounded-lg border border-sand-400 text-sm text-center"
              />
              <input
                type="number"
                min={0}
                step={0.5}
                placeholder="kg"
                value={row.weightKg || ""}
                onChange={(e) => updateRow(row.id, "weightKg", parseFloat(e.target.value) || 0)}
                className="w-16 h-10 px-2 rounded-lg border border-sand-400 text-sm text-center"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="text-red-600 hover:underline text-sm"
                aria-label="Remover"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
        {errors.sets && <p className="mt-1 text-sm text-red-600">{errors.sets}</p>}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-ink-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: treino A, pernas..."
          className="w-full px-4 py-3 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500 resize-none"
        />
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
