"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WorkoutForm } from "@/components/WorkoutForm";
import { getPostWorkoutMessage, getGoalAttainedMessage } from "@/lib/messages";

export default function NewWorkoutPage() {
  const router = useRouter();

  const handleSave = async (data: {
    date: string;
    durationSeconds: number;
    distanceKm: number;
    ankleWeight: boolean;
    ankleWeightKg: number | null;
    notes: string | null;
  }) => {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      let msg = "Erro ao salvar";
      try {
        const j = JSON.parse(text);
        msg = j.error || msg;
      } catch {
        if (text) msg = text.slice(0, 200);
      }
      toast.error(msg);
      throw new Error(msg);
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

  return (
    <div className="flex flex-col min-h-full">
      <WorkoutForm onSave={handleSave} onCancel={() => router.push("/workouts")} />
    </div>
  );
}
