import {
    getUserFromSession,
    getVerfiedSession,
  } from "./lib/session";
  import { NextRequest, NextResponse } from "next/server";
  
  const protectedRoutes = [
    "/home",
  ];
  const publicRoutes = ["/login", "/signup", "/"];
  
  export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    console.log(`[Middleware] Request on path: ${path}`);

    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);
  
    if (isProtectedRoute) {
      const session = await getVerfiedSession();
      if (!session) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }
      const user = await getUserFromSession();
      if (user) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }
    }
  
    if (isPublicRoute) {
      const user = await getUserFromSession();
      if (user) {
        return NextResponse.redirect(new URL("/home", req.nextUrl));
      }
    }
  
    return NextResponse.next();
  }
  
  // Routes Middleware should not run on
  export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
  };
  