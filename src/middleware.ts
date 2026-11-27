import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function verifyToken(token: string) {
  const secretKey = getSecretKey();
  if (!secretKey) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey, {
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

  const isAdminApi = pathname.startsWith("/api/admin");
  const isSuperAdminPage = pathname.startsWith("/superadmin");
  const isLoginPage = pathname === "/superadmin/login";

  if (isAdminApi && !session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (isSuperAdminPage && !isLoginPage && !session) {
    const loginUrl = new URL("/superadmin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/superadmin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/superadmin/:path*", "/api/admin/:path*"],
};