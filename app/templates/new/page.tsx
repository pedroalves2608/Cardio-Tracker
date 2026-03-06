"use client";

import { useRouter } from "next/navigation";
import { TemplateForm } from "@/components/TemplateForm";

export default function NewTemplatePage() {
  const router = useRouter();

  const handleSave = async (data: {
    name: string;
    exercises: { exerciseName: string; order: number; setsCount: number; defaultReps: number | null; defaultWeightKg: number | null }[];
  }) => {
    const res = await fetch("/api/strength-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || "Erro ao salvar");
    }
    router.push("/templates");
  };

  return (
    <div className="flex flex-col min-h-full">
      <TemplateForm onSave={handleSave} onCancel={() => router.push("/templates")} />
    </div>
  );
}
