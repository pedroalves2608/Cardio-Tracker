"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 bg-sand-50 text-ink-900 antialiased">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-ink-900 mb-2">Cardio Tracker</h1>
          <h2 className="text-lg font-semibold text-ink-800 mb-2">Algo deu errado</h2>
          <p className="text-ink-600 text-sm mb-6">
            Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="h-12 px-6 rounded-xl bg-primary-600 text-white font-medium active:opacity-90"
            >
              Tentar novamente
            </button>
            <a
              href="/workouts"
              className="h-12 px-6 rounded-xl border border-sand-400 bg-white font-medium text-ink-700 active:bg-sand-200 flex items-center justify-center"
            >
              Ir para Treinos
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
