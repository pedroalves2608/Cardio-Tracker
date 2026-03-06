"use client";

import { usePathname } from "next/navigation";
import { SideMenu } from "./SideMenu";

const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
];

export function NavWrapper() {
  const pathname = usePathname();
  const isAuthPage =
    AUTH_PATHS.includes(pathname) ||
    pathname.startsWith("/reset-password");

  if (isAuthPage) return null;
  return <SideMenu />;
}
