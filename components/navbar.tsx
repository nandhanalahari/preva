"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar({ className }: { className?: string }) {
  const { data: session, status } = useSession()

  async function handleSignOut() {
    await signOut({ redirect: false })
    window.location.href = "/"
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center border-b border-border/60 bg-background/90 px-4 backdrop-blur-sm sm:px-6",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/20 transition-transform hover:scale-105">
            <Activity className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            Preva
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {status === "loading" ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : session?.user ? (
            <>
              <Link
                href={
                  (session.user as { role?: string }).role === "patient"
                    ? "/patient-dashboard"
                    : "/dashboard"
                }
              >
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
