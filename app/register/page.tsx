"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validatePasswordStrength, PASSWORD_RULES } from "@/lib/password";

const REGISTER_LOADING_UI = (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sand-50">
    <div className="w-full max-w-app flex justify-center">
      <p className="text-ink-600">Carregando…</p>
    </div>
  </div>
);

function RegisterForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user.trim()) {
      setError("Informe o usuário.");
      return;
    }
    if (user.trim().length < 2) {
      setError("Usuário deve ter pelo menos 2 caracteres.");
      return;
    }
    if (!password) {
      setError("Informe a senha.");
      return;
    }
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      setError(strength.error ?? "Senha inválida.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.trim(),
          password,
          email: email.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar conta.");
        return;
      }
      router.push("/workouts");
      router.refresh();
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return REGISTER_LOADING_UI;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sand-50">
      <div className="w-full max-w-app">
        <h1 className="text-2xl font-bold text-ink-900 text-center mb-2">
          Criar conta
        </h1>
        <p className="text-ink-600 text-center mb-8 text-sm">
          Escolha um usuário e uma senha
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-sand-300/60 shadow-card p-6 space-y-5"
        >
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-ink-700 mb-1">
              Usuário
            </label>
            <input
              id="user"
              type="text"
              autoComplete="username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Mínimo 2 caracteres"
              className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">
              Email <span className="text-ink-400">(opcional, para recuperar senha)</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={PASSWORD_RULES}
              className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              disabled={loading}
            />
            <p className="text-xs text-ink-500 mt-1">{PASSWORD_RULES}</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-1">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[2.75rem] rounded-xl bg-primary-600 text-white font-medium active:opacity-90 disabled:opacity-50"
          >
            {loading ? "Criando…" : "Criar conta"}
          </button>

          <p className="text-center text-sm text-ink-600 pt-2">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary-600 font-medium active:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={REGISTER_LOADING_UI}>
      <RegisterForm />
    </Suspense>
  );
}
