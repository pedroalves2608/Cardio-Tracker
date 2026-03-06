"use client";

import { useEffect, useState } from "react";

type AchievementItem = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
};

export default function AchievementsPage() {
  const [list, setList] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/achievements", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  const unlockedCount = list.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-14 z-10 bg-sand-50/95 backdrop-blur border-b border-sand-300/50 px-4 py-4">
        <p className="text-sm text-ink-500 max-w-app mx-auto">
          {unlockedCount} de {list.length} desbloqueadas
        </p>
      </header>
      <div className="p-4 max-w-app mx-auto w-full">
        {loading ? (
          <p className="text-center text-ink-500">Carregando…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {list.map((a) => (
              <div
                key={a.slug}
                className={`p-4 rounded-xl border text-center ${
                  a.unlocked
                    ? "bg-primary-50 border-primary-200"
                    : "bg-sand-50 border-sand-300/60 opacity-80"
                }`}
              >
                <span className="text-3xl block mb-2" aria-hidden>
                  {a.icon}
                </span>
                <h2 className="font-semibold text-ink-900 text-sm">{a.name}</h2>
                <p className="text-xs text-ink-600 mt-0.5">{a.description}</p>
                {a.unlockedAt && (
                  <p className="text-xs text-ink-500 mt-1">Desbloqueada em {a.unlockedAt}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
