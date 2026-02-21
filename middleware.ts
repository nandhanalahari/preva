import { auth } from "@/lib/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session?.user) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/patient-dashboard") || pathname.startsWith("/patients/") || pathname.startsWith("/onboarding/")) {
      const signIn = new URL("/signin", req.url)
      signIn.searchParams.set("callbackUrl", pathname)
      return Response.redirect(signIn)
    }
    return undefined
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/patients/")) {
    if (role !== "nurse") return Response.redirect(new URL("/patient-dashboard", req.url))
  }
  if (pathname.startsWith("/patient-dashboard")) {
    if (role !== "patient") return Response.redirect(new URL("/dashboard", req.url))
  }

  return undefined
})

export const config = {
  matcher: ["/dashboard/:path*", "/patient-dashboard/:path*", "/patients/:path*", "/onboarding/:path*"],
}
