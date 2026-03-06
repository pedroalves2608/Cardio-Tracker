"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems: { href: string; label: string; icon: string }[] = [
  { href: "/workouts", label: "Treinos", icon: "📋" },
  { href: "/workouts/new", label: "Adicionar treino", icon: "➕" },
  { href: "/charts", label: "Gráficos", icon: "📈" },
  { href: "/prs", label: "Recordes pessoais", icon: "🏆" },
  { href: "/achievements", label: "Conquistas", icon: "🎯" },
  { href: "/templates", label: "Templates", icon: "📄" },
  { href: "/goals", label: "Metas", icon: "📌" },
  { href: "/profile", label: "Perfil", icon: "👤" },
  { href: "/logout", label: "Sair", icon: "🚪" },
];

const pathToTitle: Record<string, string> = {
  "/": "Treinos",
  "/workouts": "Treinos",
  "/workouts/new": "Novo cardio",
  "/workouts/strength/new": "Novo treino",
  "/charts": "Gráficos",
  "/prs": "Recordes",
  "/achievements": "Conquistas",
  "/templates": "Templates",
  "/goals": "Metas",
  "/profile": "Perfil",
};

function getPageTitle(pathname: string): string {
  if (pathToTitle[pathname]) return pathToTitle[pathname];
  if (pathname.startsWith("/workouts/strength/") && pathname.includes("/edit")) return "Editar treino";
  if (pathname.startsWith("/workouts/") && pathname.includes("/edit")) return "Editar treino";
  if (pathname.startsWith("/templates/") && pathname.includes("/edit")) return "Editar template";
  if (pathname.startsWith("/templates/new")) return "Novo template";
  return "Cardio Tracker";
}

export function SideMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUsername(data?.user?.username ?? null))
      .catch(() => setUsername(null));
  }, []);

  const title = getPageTitle(pathname);
  const isWorkoutsActive =
    pathname === "/" ||
    pathname === "/workouts" ||
    (pathname.startsWith("/workouts/") && pathname !== "/workouts/new");

  return (
    <>
      {/* AppBar */}
      <header className="sticky top-0 z-40 flex items-center h-14 px-4 bg-white/80 backdrop-blur-md border-b border-sand-300/50 shadow-sm">
        <div className="flex items-center gap-3 w-full max-w-app mx-auto">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-ink-600 hover:bg-sand-200/80 active:bg-sand-300 transition-colors -ml-1"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-ink-900 tracking-tight truncate flex-1">
            {title}
          </h1>
        </div>
      </header>

      {/* Backdrop */}
      <div
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 z-50 bg-ink-900/20 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        aria-modal="true"
        aria-label="Menu principal"
        className={`fixed top-0 left-0 z-50 h-full w-[min(18rem,85vw)] bg-white border-r border-sand-300/60 shadow-xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-sand-300/60">
          <span className="font-semibold text-ink-900 tracking-tight">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-ink-500 hover:bg-sand-200 active:bg-sand-300 transition-colors"
            aria-label="Fechar menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-4 bg-sand-100/80 border-b border-sand-300/60">
          {username ? (
            <p className="text-sm font-medium text-ink-800 truncate">Olá, {username}</p>
          ) : (
            <p className="text-sm text-ink-500">Conta</p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="px-2 space-y-0.5">
            {navItems.map(({ href, label, icon }) => {
              const isActive =
                href === "/workouts"
                  ? isWorkoutsActive
                  : href !== "/logout" && pathname.startsWith(href);
              const isLogout = href === "/logout";
              return (
                <li key={href}>
                  <Link
                    href={href === "/workouts" ? "/" : href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                      isLogout
                        ? "text-ink-500 hover:bg-sand-200 hover:text-ink-700"
                        : isActive
                          ? "bg-primary-500/10 text-primary-700"
                          : "text-ink-700 hover:bg-sand-200/80"
                    }`}
                  >
                    <span className="text-xl w-7 text-center shrink-0" aria-hidden>
                      {icon}
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-3 border-t border-sand-300/60">
          <p className="text-xs text-ink-400 font-medium">Cardio Tracker</p>
        </div>
      </aside>
    </>
  );
}
