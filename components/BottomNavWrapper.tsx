"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

export function BottomNavWrapper() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname.startsWith("/reset-password") || pathname === "/verify-email") return null;
  return <BottomNav />;
}
