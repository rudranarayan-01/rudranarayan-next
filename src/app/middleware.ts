import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("admin_session")?.value;
  const session = sessionCookie ? await verifyToken(sessionCookie) : null;

  // Protect /superadmin routes except /superadmin/login
  if (pathname.startsWith("/superadmin") && pathname !== "/superadmin/login") {
    if (!session) {
      return NextResponse.redirect(new URL("/superadmin/login", request.url));
    }
  }

  // Prevent logged-in admin from visiting login page
  if (pathname === "/superadmin/login" && session) {
    return NextResponse.redirect(new URL("/superadmin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/superadmin/:path*"],
};