"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/workouts", label: "Treinos", icon: "📋" },
  { href: "/workouts/new", label: "Adicionar", icon: "➕" },
  { href: "/charts", label: "Gráficos", icon: "📈" },
  { href: "/prs", label: "PRs", icon: "🏆" },
  { href: "/achievements", label: "Conquistas", icon: "🎯" },
  { href: "/templates", label: "Templates", icon: "📄" },
  { href: "/profile", label: "Perfil", icon: "👤" },
  { href: "/logout", label: "Sair", icon: "🚪" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-sand-50/98 backdrop-blur border-t border-sand-300/60 shadow-card pb-safe"
      style={{ maxWidth: "var(--max-app, 28rem)", margin: "0 auto" }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon }) => {
          const isActive =
            href === "/workouts"
              ? pathname === "/" || pathname === "/workouts" || (pathname.startsWith("/workouts/") && pathname !== "/workouts/new")
              : href !== "/logout" && pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href === "/workouts" ? "/" : href}
              className={`flex flex-col items-center justify-center flex-1 py-2 text-xs font-medium min-w-0 touch-target ${
                isActive
                  ? "text-primary-600"
                  : "text-ink-500 active:text-ink-700"
              }`}
            >
              <span className="text-lg mb-0.5" aria-hidden>
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
