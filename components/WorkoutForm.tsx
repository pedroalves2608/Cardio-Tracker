"use client";

import { useState, useCallback } from "react";
import type { CardioSession } from "@/lib/types";
import { formatDuration, parseTimeToSeconds } from "@/lib/utils";

type WorkoutFormProps = {
  initial?: Partial<CardioSession> | null;
  onSave: (data: {
    date: string;
    durationSeconds: number;
    distanceKm: number;
    ankleWeight: boolean;
    ankleWeightKg: number | null;
    notes: string | null;
  }) => Promise<void>;
  onCancel: () => void;
};

/** Converte ISO para exibição no padrão brasileiro DD/MM/AAAA */
function toDateBR(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

/** Parse string DD/MM/AAAA para Date (retorna invalid Date se inválido) */
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

function toTimeFromSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function WorkoutForm({ initial, onSave, onCancel }: WorkoutFormProps) {
  const [date, setDate] = useState(
    initial?.date ? toDateBR(initial.date) : toDateBR(new Date().toISOString())
  );
  const [timeInput, setTimeInput] = useState(
    initial?.durationSeconds != null
      ? toTimeFromSeconds(initial.durationSeconds)
      : "0:00"
  );
  const [distance, setDistance] = useState(
    initial?.distanceKm != null ? String(initial.distanceKm) : ""
  );
  const [ankleWeight, setAnkleWeight] = useState(initial?.ankleWeight ?? false);
  const [ankleWeightKg, setAnkleWeightKg] = useState(
    initial?.ankleWeightKg != null && initial.ankleWeightKg > 0
      ? String(initial.ankleWeightKg)
      : ""
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!date.trim()) e.date = "Informe a data (dia/mês/ano).";
    else {
      const parsed = parseDateBR(date);
      if (isNaN(parsed.getTime())) e.date = "Data inválida. Use o formato DD/MM/AAAA (ex: 03/05/2026).";
    }
    const durationSeconds = parseTimeToSeconds(timeInput);
    if (durationSeconds <= 0) e.time = "Informe o tempo (ex: 12 ou 12:30).";
    const dist = parseFloat(distance.replace(",", "."));
    if (isNaN(dist) || dist <= 0) e.distance = "Distância deve ser um número maior que zero (ex: 3.2).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [date, timeInput, distance]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const durationSeconds = parseTimeToSeconds(timeInput);
    const distanceKm = parseFloat(distance.replace(",", "."));
    setSaving(true);
    try {
      const weightKg =
        ankleWeight && ankleWeightKg.trim() !== ""
          ? parseFloat(ankleWeightKg.replace(",", "."))
          : null;
      const weightValue =
        weightKg != null && !isNaN(weightKg) && weightKg > 0 ? weightKg : null;
      const dateObj = parseDateBR(date);
      await onSave({
        date: dateObj.toISOString(),
        durationSeconds,
        distanceKm,
        ankleWeight,
        ankleWeightKg: weightValue,
        notes: notes.trim() || null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível salvar. Tente novamente.";
      setErrors({ form: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-app mx-auto">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-ink-700 mb-1">
          Data do treino (dia/mês/ano)
        </label>
        <input
          id="date"
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/AAAA (ex: 03/05/2026)"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          maxLength={10}
          className="w-full h-12 px-4 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500/30/30 focus:border-primary-500"
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-ink-700 mb-1">
          Tempo (minutos:segundos, ex: 12:30)
        </label>
        <input
          id="time"
          type="text"
          inputMode="numeric"
          placeholder="12:30"
          value={timeInput}
          onChange={(e) => setTimeInput(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500/30/30 focus:border-primary-500"
        />
        {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
      </div>

      <div>
        <label htmlFor="distance" className="block text-sm font-medium text-ink-700 mb-1">
          Distância (km)
        </label>
        <input
          id="distance"
          type="text"
          inputMode="decimal"
          placeholder="5.2"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500/30/30 focus:border-primary-500"
        />
        {errors.distance && <p className="mt-1 text-sm text-red-600">{errors.distance}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="ankle"
          type="checkbox"
          checked={ankleWeight}
          onChange={(e) => setAnkleWeight(e.target.checked)}
          className="h-6 w-6 rounded border-sand-400 text-primary-600 focus:ring-primary-500/30"
        />
        <label htmlFor="ankle" className="text-base font-medium text-ink-700">
          Com peso no pé?
        </label>
      </div>
      {ankleWeight && (
        <div>
          <label htmlFor="ankleKg" className="block text-sm font-medium text-ink-700 mb-1">
            Peso no pé (kg)
          </label>
          <input
            id="ankleKg"
            type="text"
            inputMode="decimal"
            placeholder="Ex: 0.5, 1, 2"
            value={ankleWeightKg}
            onChange={(e) => setAnkleWeightKg(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500/30/30 focus:border-primary-500"
          />
          <p className="mt-1 text-xs text-ink-500">
            Opcional. Se informado, o app calcula a carga (distância × peso) para comparar treinos.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-ink-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: corrida leve, esteira..."
          className="w-full px-4 py-3 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500/30/30 focus:border-primary-500 resize-none"
        />
      </div>

      {errors.form && (
        <p className="text-sm text-red-600">{errors.form}</p>
      )}

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
