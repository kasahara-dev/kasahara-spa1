import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  if (pathname === "/login" || pathname === "/staff/login") {
    return NextResponse.next();
  }
  if (!token) {
    if (pathname.startsWith("/staff")) {
      return NextResponse.redirect(new URL("/staff/login", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/staff") && token.role !== "staff") {
    return NextResponse.redirect(new URL("/staff/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)"],
};
