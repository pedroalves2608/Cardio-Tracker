"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link inválido.");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data.ok) {
          setStatus("ok");
        } else {
          setStatus("error");
          setMessage(data.error ?? "Falha ao confirmar email.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erro de conexão.");
      });
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sand-50">
        <p className="text-ink-600">Confirmando email…</p>
      </div>
    );
  }

  if (status === "ok") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sand-50">
        <div className="bg-white rounded-2xl border border-sand-300/60 shadow-card p-6 max-w-app w-full text-center">
          <p className="text-green-700 font-medium mb-4">Email confirmado com sucesso.</p>
          <Link href="/workouts" className="text-primary-600 font-medium active:underline">
            Ir para o app
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sand-50">
      <div className="bg-white rounded-2xl border border-sand-300/60 shadow-card p-6 max-w-app w-full text-center">
        <p className="text-red-600 mb-4">{message}</p>
        <Link href="/login" className="text-primary-600 font-medium active:underline">
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-sand-50">
          <p className="text-ink-600">Carregando…</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
