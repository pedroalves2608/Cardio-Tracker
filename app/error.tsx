"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-semibold text-ink-900 mb-2">Algo deu errado</h2>
      <p className="text-ink-600 text-sm mb-6 max-w-md">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="h-12 px-6 rounded-xl bg-primary-600 text-white font-medium active:opacity-90 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Tentar novamente
      </button>
    </div>
  );
}
