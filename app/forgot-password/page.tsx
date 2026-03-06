"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetLink(null);
    if (!email.trim()) {
      setError("Informe o email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar. Tente novamente.");
        return;
      }
      setMessage(
        data.resetLink
          ? "Link criado. Use o link abaixo para redefinir a senha (em desenvolvimento)."
          : (data.message ?? "Se existir uma conta com este email, você receberá um link.")
      );
      if (data.resetLink) setResetLink(data.resetLink);
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sand-50">
      <div className="w-full max-w-app">
        <h1 className="text-2xl font-semibold text-ink-900 text-center mb-2">
          Esqueci a senha
        </h1>
        <p className="text-ink-600 text-center mb-8 text-sm">
          Informe o email da sua conta para receber um link de redefinição
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-sand-300/60 shadow-card p-6 space-y-5"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full h-12 px-4 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}
          {message && (
            <p className="text-sm text-ink-700 bg-sand-50 px-3 py-2 rounded-xl">{message}</p>
          )}
          {resetLink && (
            <div className="rounded-xl bg-primary-50 border border-primary-200 p-4">
              <p className="text-sm font-medium text-primary-800 mb-2">Link para redefinir senha:</p>
              <a
                href={resetLink}
                className="text-sm text-primary-600 underline break-all font-medium"
              >
                {resetLink}
              </a>
              <p className="text-xs text-ink-600 mt-2">
                Ou{" "}
                <a href={resetLink} className="text-primary-600 underline font-medium">
                  abrir página de redefinição
                </a>
                . Configure RESEND_API_KEY no .env para enviar por email.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary-600 text-white font-medium active:opacity-90 disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Enviar link"}
          </button>

          <p className="text-center text-sm text-ink-600 pt-2">
            <Link href="/login" className="text-primary-600 font-medium active:underline">
              Voltar ao login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
