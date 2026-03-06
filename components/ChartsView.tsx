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
import type { CardioSession, StrengthSession } from "@/lib/types";
import { formatPace, paceSecondsPerKm, loadKgKm } from "@/lib/utils";
import { format, subDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ChartRange } from "@/lib/types";

type MainTab = "cardio" | "strength";
type Tab = "distance" | "time" | "pace";
type WeightFilter = "all" | "with" | "without";

const ranges: { value: ChartRange; label: string }[] = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
  { value: "all", label: "Tudo" },
];

type ChartsViewProps = {
  workouts: CardioSession[];
  strengthSessions?: StrengthSession[];
  loading?: boolean;
};

export function ChartsView({ workouts, strengthSessions = [], loading }: ChartsViewProps) {
  const [mainTab, setMainTab] = useState<MainTab>("cardio");
  const [tab, setTab] = useState<Tab>("distance");
  const [range, setRange] = useState<ChartRange>("30");
  const [weightFilter, setWeightFilter] = useState<WeightFilter>("all");

  const filtered = useMemo(() => {
    const hasWeight = (w: CardioSession) =>
      w.ankleWeight || (w.ankleWeightKg != null && w.ankleWeightKg > 0);
    let list = workouts;
    if (weightFilter === "with") list = workouts.filter(hasWeight);
    if (weightFilter === "without") list = workouts.filter((w) => !hasWeight(w));
    if (range !== "all") {
      const days = parseInt(range, 10);
      const since = subDays(new Date(), days);
      list = list.filter((w) => new Date(w.date) >= since);
    }
    return list.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [workouts, range, weightFilter]);

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

  const strengthChartData = useMemo(() => {
    const since =
      range === "all"
        ? null
        : subDays(new Date(), parseInt(range, 10));
    const strengthFiltered = since
      ? strengthSessions.filter((s) => new Date(s.date) >= since)
      : [...strengthSessions];
    const byWeek = new Map<string, { weekLabel: string; sessions: number; volumeKg: number }>();
    for (const s of strengthFiltered) {
      const d = new Date(s.date);
      const weekStart = startOfWeek(d, { weekStartsOn: 0 });
      const key = weekStart.toISOString().slice(0, 10);
      if (!byWeek.has(key)) {
        byWeek.set(key, {
          weekLabel: format(weekStart, "dd/MM", { locale: ptBR }),
          sessions: 0,
          volumeKg: 0,
        });
      }
      const row = byWeek.get(key)!;
      row.sessions += 1;
      for (const set of s.sets) row.volumeKg += set.reps * set.weightKg;
    }
    return Array.from(byWeek.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => ({ ...v, volumeKg: Math.round(v.volumeKg * 10) / 10 }));
  }, [strengthSessions, range]);

  if (loading) {
    return (
      <div className="p-8 text-center text-ink-500">Carregando…</div>
    );
  }

  const hasCardio = workouts.length > 0;
  const hasStrength = strengthSessions.length > 0;
  if (!hasCardio && !hasStrength) {
    return (
      <div className="p-8 text-center text-ink-500">
        <p className="text-lg">Nenhum treino cadastrado ainda.</p>
        <p className="mt-2 text-sm">Registre treinos para ver os gráficos.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-app mx-auto">
      <div className="flex gap-2 pb-2">
        <button
          type="button"
          onClick={() => setMainTab("cardio")}
          className={`px-4 py-2 rounded-xl font-medium ${mainTab === "cardio" ? "bg-primary-600 text-white" : "bg-sand-200 text-ink-700"}`}
        >
          Cardio
        </button>
        <button
          type="button"
          onClick={() => setMainTab("strength")}
          className={`px-4 py-2 rounded-xl font-medium ${mainTab === "strength" ? "bg-primary-600 text-white" : "bg-sand-200 text-ink-700"}`}
        >
          Força
        </button>
      </div>

      {mainTab === "strength" && (
        <>
          <div className="flex flex-wrap gap-2">
            {ranges.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  range === r.value ? "bg-primary-100 text-primary-700" : "bg-sand-100 text-ink-600"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {strengthChartData.length === 0 ? (
            <div className="py-12 text-center text-ink-500">Nenhum treino de força no período.</div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={strengthChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={(v) => `${v} kg`} />
                  <Tooltip contentStyle={{ borderRadius: "12px" }} />
                  <Line yAxisId="left" type="monotone" dataKey="sessions" name="Treinos" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="volumeKg" name="Volume (kg)" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {mainTab === "cardio" && (
        <>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["distance", "time", "pace"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${
              tab === t
                ? "bg-primary-600 text-white"
                : "bg-sand-200 text-ink-700"
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
                : "bg-sand-100 text-ink-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-ink-700 mb-2">Treinos</p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all" as const, label: "Todos" },
            { value: "with" as const, label: "Com peso no pé" },
            { value: "without" as const, label: "Sem peso no pé" },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setWeightFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                weightFilter === value
                  ? "bg-primary-600 text-white"
                  : "bg-sand-100 text-ink-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <div className="py-12 text-center text-ink-500">
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
        </>
      )}
    </div>
  );
}
