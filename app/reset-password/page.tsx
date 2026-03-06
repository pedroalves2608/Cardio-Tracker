"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { validatePasswordStrength, PASSWORD_RULES } from "@/lib/password";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!tokenFromUrl) {
      setError("Link inválido. Use o link que enviamos por email.");
      return;
    }
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      setError(strength.error ?? "Senha inválida.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenFromUrl, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao redefinir senha.");
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenFromUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sand-50">
        <div className="w-full max-w-app bg-white rounded-2xl border border-sand-300/60 shadow-card p-6">
          <p className="text-ink-700 mb-4">
            Link inválido ou expirado. Solicite um novo em &quot;Esqueci a senha&quot;.
          </p>
          <Link href="/forgot-password" className="text-primary-600 font-medium active:underline">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sand-50">
      <div className="w-full max-w-app">
        <h1 className="text-2xl font-bold text-ink-900 text-center mb-2">
          Nova senha
        </h1>
        <p className="text-ink-600 text-center mb-8 text-sm">
          Digite e confirme sua nova senha
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-sand-300/60 shadow-card p-6 space-y-5"
        >
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-ink-700 mb-1">
              Nova senha
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={PASSWORD_RULES}
              className="w-full h-12 px-4 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              disabled={loading}
            />
            <p className="text-xs text-ink-500 mt-1">{PASSWORD_RULES}</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-1">
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              className="w-full h-12 px-4 rounded-xl border border-sand-400 text-base focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary-600 text-white font-medium active:opacity-90 disabled:opacity-50"
          >
            {loading ? "Salvando…" : "Redefinir senha"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-sand-50">
          <p className="text-ink-600">Carregando…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
