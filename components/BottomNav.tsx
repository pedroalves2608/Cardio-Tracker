"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/workouts", label: "Treinos", icon: "📋" },
  { href: "/workouts/new", label: "Adicionar", icon: "➕" },
  { href: "/charts", label: "Gráficos", icon: "📈" },
  { href: "/logout", label: "Sair", icon: "🚪" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg pb-safe"
      style={{ maxWidth: "var(--max-app, 28rem)", margin: "0 auto" }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon }) => {
          const isActive =
            href === "/workouts"
              ? pathname === "/" || pathname === "/workouts" || (pathname.startsWith("/workouts/") && pathname !== "/workouts/new")
              : href !== "/logout" && pathname === href;
          return (
            <Link
              key={href}
              href={href === "/workouts" ? "/" : href}
              className={`flex flex-col items-center justify-center flex-1 py-2 text-sm font-medium min-w-0 ${
                isActive
                  ? "text-primary-600 bg-primary-50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className="text-xl mb-0.5" aria-hidden>
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
