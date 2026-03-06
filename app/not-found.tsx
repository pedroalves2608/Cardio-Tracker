import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-sand-50">
      <div className="w-full max-w-app text-center">
        <h1 className="text-2xl font-semibold text-ink-900 mb-2 tracking-tight">Página não encontrada</h1>
        <p className="text-ink-600 text-sm mb-8">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/workouts"
            className="min-h-[2.75rem] px-6 rounded-2xl bg-primary-600 text-white font-medium flex items-center justify-center active:opacity-90"
          >
            Ir para Treinos
          </Link>
          <Link
            href="/login"
            className="min-h-[2.75rem] px-6 rounded-2xl border border-sand-400 bg-white font-medium text-ink-700 flex items-center justify-center active:bg-sand-200"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
