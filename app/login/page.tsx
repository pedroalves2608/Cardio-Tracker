"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const LOGIN_LOADING_UI = (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sand-50">
    <div className="w-full max-w-app flex justify-center">
      <p className="text-ink-600">Carregando…</p>
    </div>
  </div>
);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/workouts";

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
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
    if (!password) {
      setError("Informe a senha.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Usuário ou senha incorretos.");
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return LOGIN_LOADING_UI;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sand-50">
      <div className="w-full max-w-app">
        <h1 className="text-2xl font-semibold text-ink-900 text-center mb-2 tracking-tight">
          Cardio Tracker
        </h1>
        <p className="text-ink-600 text-center mb-8 text-sm">
          Entre com seu usuário e senha
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-sand-300/60 shadow-card p-6 space-y-5"
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
              placeholder="Digite seu usuário"
              className="w-full min-h-[2.75rem] px-4 rounded-xl border border-sand-400 bg-sand-50 text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-base"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-ink-700">
                Senha
              </label>
              <Link href="/forgot-password" className="text-sm text-primary-600 font-medium active:underline">
                Esqueci a senha
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full min-h-[2.75rem] px-4 rounded-xl border border-sand-400 bg-sand-50 text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-base"
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
            {loading ? "Entrando…" : "Entrar"}
          </button>

          <p className="text-center text-sm text-ink-600 pt-2">
            Não tem conta?{" "}
            <Link href="/register" className="text-primary-600 font-medium active:underline">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={LOGIN_LOADING_UI}>
      <LoginForm />
    </Suspense>
  );
}
