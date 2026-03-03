"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CardioSession } from "@/lib/types";
import { formatPace, paceSecondsPerKm, loadKgKm } from "@/lib/utils";
import { format, subDays, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ChartRange } from "@/lib/types";

type Tab = "distance" | "time" | "pace";

const ranges: { value: ChartRange; label: string }[] = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
  { value: "all", label: "Tudo" },
];

type ChartsViewProps = {
  workouts: CardioSession[];
  loading?: boolean;
};

export function ChartsView({ workouts, loading }: ChartsViewProps) {
  const [tab, setTab] = useState<Tab>("distance");
  const [range, setRange] = useState<ChartRange>("30");
  const [ankleOnly, setAnkleOnly] = useState(false);

  const filtered = useMemo(() => {
    const hasWeight = (w: CardioSession) =>
      w.ankleWeight || (w.ankleWeightKg != null && w.ankleWeightKg > 0);
    let list = ankleOnly ? workouts.filter(hasWeight) : workouts;
    if (range === "all") return list;
    const days = parseInt(range, 10);
    const since = subDays(new Date(), days);
    list = list.filter((w) => new Date(w.date) >= since);
    return list.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [workouts, range, ankleOnly]);

  const chartData = useMemo(() => {
    return filtered.map((w) => {
      const date = format(new Date(w.date), "dd/MM", { locale: ptBR });
      const pace = paceSecondsPerKm(w.durationSeconds, w.distanceKm);
      const load = loadKgKm(w.distanceKm, w.ankleWeightKg);
      return {
        date,
        fullDate: w.date,
        distance: Math.round(w.distanceKm * 10) / 10,
        time: w.durationSeconds,
        timeMin: Math.round(w.durationSeconds / 60),
        pace: pace ?? 0,
        paceFormatted: formatPace(pace),
        ankleWeightKg: w.ankleWeightKg,
        load,
      };
    });
  }, [filtered]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Carregando…</div>
    );
  }

  if (!workouts.length) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-lg">Nenhum treino cadastrado ainda.</p>
        <p className="mt-2 text-sm">Registre treinos para ver os gráficos.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-app mx-auto">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["distance", "time", "pace"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${
              tab === t
                ? "bg-primary-600 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {t === "distance" && "Distância"}
            {t === "time" && "Tempo"}
            {t === "pace" && "Pace"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {ranges.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRange(r.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              range === r.value
                ? "bg-primary-100 text-primary-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={ankleOnly}
          onChange={(e) => setAnkleOnly(e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-primary-600"
        />
        <span className="text-sm font-medium text-slate-700">
          Somente com peso no pé
        </span>
      </label>

      {!filtered.length ? (
        <div className="py-12 text-center text-slate-500">
          Nenhum dado no período selecionado.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                tickFormatter={
                  tab === "time"
                    ? (v) => `${Math.round(v / 60)} min`
                    : tab === "pace"
                    ? (v) => formatPace(v)
                    : undefined
                }
              />
              <Tooltip
                contentStyle={{ borderRadius: "12px" }}
                formatter={(value: number) =>
                  tab === "time"
                    ? `${Math.round(value / 60)} min`
                    : tab === "pace"
                    ? formatPace(value)
                    : value
                }
                labelFormatter={(label, payload) => {
                  const p = payload?.[0]?.payload;
                  const extra =
                    p?.ankleWeightKg != null && p.ankleWeightKg > 0
                      ? ` • Peso: ${p.ankleWeightKg} kg${p.load != null ? ` • Carga: ${p.load} kg·km` : ""}`
                      : "";
                  return `Data: ${label}${extra}`;
                }}
              />
              {tab === "distance" && (
                <Line
                  type="monotone"
                  dataKey="distance"
                  name="Distância (km)"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              )}
              {tab === "time" && (
                <Line
                  type="monotone"
                  dataKey="time"
                  name="Tempo"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              )}
              {tab === "pace" && (
                <Line
                  type="monotone"
                  dataKey="pace"
                  name="Pace (min/km)"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
