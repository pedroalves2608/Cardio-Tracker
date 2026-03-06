"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StrengthSessionForm } from "@/components/StrengthSessionForm";
import { getPostWorkoutMessage, getGoalAttainedMessage } from "@/lib/messages";
import type { StrengthSession } from "@/lib/types";

export default function NewStrengthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);
  const [lastSession, setLastSession] = useState<StrengthSession | null>(null);
  const [useLastSession, setUseLastSession] = useState(false);

  useEffect(() => {
    if (templateId) return;
    fetch("/api/strength-sessions", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((sessions: StrengthSession[]) => setLastSession(sessions[0] ?? null));
  }, [templateId]);

  useEffect(() => {
    if (!templateId) return;
    const run = async () => {
      setCreatingFromTemplate(true);
      try {
        const res = await fetch("/api/strength-sessions/from-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId, date: new Date().toISOString() }),
        });
        if (res.ok) {
          const data = await res.json();
          router.replace(`/workouts/strength/${data.id}/edit`);
          return;
        }
      } catch {
        setCreatingFromTemplate(false);
      }
      setCreatingFromTemplate(false);
    };
    run();
  }, [templateId, router]);

  const handleSave = async (data: {
    date: string;
    notes: string | null;
    sets: { exerciseName: string; setNumber: number; reps: number; weightKg: number }[];
  }) => {
    const res = await fetch("/api/strength-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Erro ao salvar");
      throw new Error(j.error || "Erro ao salvar");
    }
    const result = await res.json();
    toast.success(getPostWorkoutMessage());
    if (result.newPr) toast.success("Novo recorde em " + result.newPr.label + "!");
    if (result.goalAttained) toast.success(getGoalAttainedMessage());
    (result.newlyUnlocked ?? []).forEach((u: { name: string }) =>
      toast.success("Conquista desbloqueada: " + u.name)
    );
    router.push("/workouts");
  };

  if (templateId && creatingFromTemplate) {
    return (
      <div className="p-4 text-center text-ink-500">
        Criando treino a partir do template…
      </div>
    );
  }

  if (templateId) return null;

  const prefillInitial =
    useLastSession && lastSession
      ? {
          date: new Date().toISOString(),
          notes: "",
          sets: lastSession.sets,
        }
      : undefined;

  return (
    <div className="flex flex-col min-h-full">
      {lastSession && !useLastSession && (
        <div className="sticky top-14 z-10 px-4 py-2 bg-sand-100/90 border-b border-sand-300/50">
          <button
            type="button"
            onClick={() => setUseLastSession(true)}
            className="w-full py-2.5 rounded-xl border border-primary-300 bg-primary-50 text-primary-700 text-sm font-medium"
          >
            Usar último treino
          </button>
        </div>
      )}
      <StrengthSessionForm
        key={useLastSession ? "prefill" : "new"}
        initial={prefillInitial as Partial<StrengthSession>}
        onSave={handleSave}
        onCancel={() => router.push("/workouts")}
      />
    </div>
  );
}
