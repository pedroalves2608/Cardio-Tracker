"use client";

import { useEffect, useState } from "react";
import { validatePasswordStrength, PASSWORD_RULES } from "@/lib/password";

type User = { id: string; username: string; email: string | null; emailVerified?: boolean };

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword) {
      setPasswordError("Informe a senha atual.");
      return;
    }
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      setPasswordError(strength.error ?? "Senha inválida.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(data.error ?? "Erro ao alterar senha.");
        return;
      }
      setPasswordSuccess("Senha alterada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Erro ao conectar. Tente novamente.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendError("");
    setResendMessage("");
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResendError(data.error ?? "Erro ao reenviar.");
        return;
      }
      setResendMessage(data.message ?? "Email reenviado.");
    } catch {
      setResendError("Erro de conexão.");
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-sand-50">
        <p className="text-ink-600">Carregando…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-sand-50">
        <p className="text-ink-600">Não foi possível carregar o perfil.</p>
      </div>
    );
  }

  const canChangePassword = user.id !== "env-fallback";

  return (
    <div className="min-h-full flex flex-col p-4 pb-24 bg-sand-50">
      <div className="max-w-app mx-auto w-full space-y-6">
        <h1 className="text-2xl font-bold text-ink-900">Perfil</h1>

        <section className="bg-white rounded-2xl border-sand-300/60 shadow-card p-6">
          <h2 className="text-sm font-medium text-ink-500 mb-2">Dados da conta</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-ink-400">Usuário</dt>
              <dd className="text-ink-900 font-medium">{user.username}</dd>
            </div>
            {user.email ? (
              <>
                <div>
                  <dt className="text-xs text-ink-400">Email</dt>
                  <dd className="text-ink-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-400">Status</dt>
                  <dd className="text-ink-700">
                    {user.emailVerified ? (
                      <span className="text-green-600 text-sm font-medium">Verificado</span>
                    ) : (
                      <span className="text-primary-600 text-sm">Não verificado</span>
                    )}
                  </dd>
                </div>
                {user.email && !user.emailVerified && user.id !== "env-fallback" && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="text-sm text-primary-600 font-medium active:underline disabled:opacity-50"
                    >
                      {resendLoading ? "Enviando…" : "Reenviar email de confirmação"}
                    </button>
                    {resendMessage && (
                      <p className="text-sm text-green-700 mt-1">{resendMessage}</p>
                    )}
                    {resendError && (
                      <p className="text-sm text-red-600 mt-1">{resendError}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div>
                <dt className="text-xs text-ink-400">Email</dt>
                <dd className="text-ink-500 text-sm">Não informado</dd>
              </div>
            )}
          </dl>
        </section>

        {canChangePassword ? (
          <section className="bg-white rounded-2xl border-sand-300/60 shadow-card p-6">
            <h2 className="text-sm font-medium text-ink-500 mb-4">Alterar senha</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-ink-700 mb-1">
                  Senha atual
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  disabled={passwordLoading}
                />
              </div>
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
                  className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  disabled={passwordLoading}
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
                  className="w-full min-h-[2.75rem] px-4 rounded-xl border-sand-400 bg-sand-50 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  disabled={passwordLoading}
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{passwordSuccess}</p>
              )}
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full min-h-[2.75rem] rounded-xl bg-primary-600 text-white font-medium active:opacity-90 disabled:opacity-50"
              >
                {passwordLoading ? "Alterando…" : "Alterar senha"}
              </button>
            </form>
          </section>
        ) : (
          <section className="bg-white rounded-2xl border-sand-300/60 shadow-card p-6">
            <p className="text-ink-600 text-sm">
              Você entrou com usuário de ambiente. Para alterar senha, crie uma conta em &quot;Criar conta&quot; na tela de login.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
