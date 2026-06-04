import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PROTECTED = ["/dashboard", "/listings/new", "/listings/*/edit", "/admin", "/account"];
const AUTH_ONLY = ["/auth"];

function matches(pathname: string, patterns: string[]): boolean {
  return patterns.some((p) => {
    const regex = new RegExp("^" + p.replace(/\*/g, "[^/]+") + "(/.*)?$");
    return regex.test(pathname);
  });
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("yardexx_session")?.value;
  const session = token ? await verifyToken(token) : null;
  const { pathname } = req.nextUrl;

  if (matches(pathname, PROTECTED) && !session) {
    return NextResponse.redirect(new URL(`/auth?from=${encodeURIComponent(pathname)}`, req.url));
  }

  if (matches(pathname, ["/admin"]) && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (matches(pathname, AUTH_ONLY) && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/listings/new", "/listings/:id/edit", "/admin/:path*", "/account/:path*", "/auth"],
};
