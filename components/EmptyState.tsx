"use client";

import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="mx-4 mt-6 p-6 rounded-2xl bg-sand-100 border border-sand-300/60 text-center">
      <p className="text-lg font-semibold text-ink-900 tracking-tight">{title}</p>
      <p className="mt-2 text-sm text-ink-600 leading-relaxed">{description}</p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        {primaryAction && (
          <Link
            href={primaryAction.href}
            className="inline-flex justify-center items-center min-h-[2.75rem] px-6 rounded-2xl bg-primary-600 text-white font-medium active:opacity-90"
          >
            {primaryAction.label}
          </Link>
        )}
        {secondaryAction && (
          <Link
            href={secondaryAction.href}
            className="inline-flex justify-center items-center min-h-[2.75rem] px-6 rounded-2xl border border-sand-400 font-medium text-ink-700 bg-white active:bg-sand-200"
          >
            {secondaryAction.label}
          </Link>
        )}
      </div>
    </div>
  );
}
