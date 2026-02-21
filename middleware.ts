import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware does not use auth() here because it runs in Edge runtime,
 * and auth() pulls in MongoDB/bcrypt (Node.js 'stream' etc.).
 * Protection is done in each page/layout via auth() in Server Components (Node).
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/patient-dashboard/:path*", "/patients/:path*", "/onboarding/:path*"],
}
