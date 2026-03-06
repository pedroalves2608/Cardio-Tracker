/**
 * Cópia de referência do middleware de auth.
 * O Next.js não carrega este ficheiro. Para reativar:
 * 1. Copiar para middleware.ts (ou renomear).
 * 2. Em alguns ambientes (Node/Windows) pode ocorrer EvalError no Edge Runtime;
 *    nesse caso use npm run dev em vez de npm run start.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "cardio_session";
const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
const FORGOT_PASSWORD_PATH = "/forgot-password";
const RESET_PASSWORD_PATH = "/reset-password";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const path = request.nextUrl.pathname;

  if (path === LOGIN_PATH || path === REGISTER_PATH || path === FORGOT_PASSWORD_PATH) {
    if (token) return NextResponse.redirect(new URL("/workouts", request.url));
    return NextResponse.next();
  }
  if (path.startsWith(RESET_PASSWORD_PATH) || path === "/verify-email") {
    return NextResponse.next();
  }
  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("from", path);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
