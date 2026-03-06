"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TemplateForm } from "@/components/TemplateForm";
import type { StrengthTemplate } from "@/lib/types";

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [template, setTemplate] = useState<StrengthTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/strength-templates/${id}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(setTemplate)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (data: {
    name: string;
    exercises: { exerciseName: string; order: number; setsCount: number; defaultReps: number | null; defaultWeightKg: number | null }[];
  }) => {
    const res = await fetch(`/api/strength-templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || "Erro ao salvar");
    }
    router.push("/templates");
  };

  if (loading) {
    return <div className="p-4 text-center text-ink-500">Carregando…</div>;
  }
  if (!template) {
    return (
      <div className="p-4 text-center text-ink-500">
        Template não encontrado.
        <button type="button" onClick={() => router.push("/templates")} className="block mt-2 text-primary-600">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <TemplateForm
        initial={template}
        onSave={handleSave}
        onCancel={() => router.push("/templates")}
      />
    </div>
  );
}
