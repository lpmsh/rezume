import { NextRequest, NextResponse } from "next/server";

async function getSession(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  if (!sessionToken) return null;

  const sessionRes = await fetch(
    new URL("/api/auth/get-session", request.url),
    {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    },
  );

  if (!sessionRes.ok) return null;

  return sessionRes.json();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes — redirect to login if not authenticated
  if (pathname.startsWith("/app")) {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Auth pages — redirect to /app if already authenticated
  if (pathname === "/login" || pathname === "/signup") {
    const session = await getSession(request);
    if (session) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    return NextResponse.next();
  }

  // Homepage — redirect to /app if authenticated
  if (pathname === "/") {
    const session = await getSession(request);
    if (session) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/app/:path*"],
};
