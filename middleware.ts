import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "cardio_session";
const LOGIN_PATH = "/login";

export function middleware(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.SESSION_SECRET ?? "cardio-secret-change-me";
  const isLoggedIn = session === secret;

  if (request.nextUrl.pathname === LOGIN_PATH) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/workouts", request.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
