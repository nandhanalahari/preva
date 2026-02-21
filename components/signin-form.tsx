"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Stethoscope, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const glowClass = "shadow-[0_0_30px_rgba(185,28,28,0.25)] ring-2 ring-primary/30"

type Role = "nurse" | "patient"

export function SignInForm() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("nurse")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    if (!password) return
    setLoading(true)
    try {
      const result =
        role === "nurse"
          ? await signIn("credentials", {
              email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
              password,
              redirect: false,
            })
          : await signIn("credentials", {
              username: (form.elements.namedItem("username") as HTMLInputElement).value.trim(),
              password,
              redirect: false,
            })
      if (result?.error) {
        setError(role === "nurse" ? "Invalid email or password." : "Invalid username or password.")
        return
      }
      router.push("/onboarding/contact")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn("mx-auto max-w-md transition-shadow", glowClass)}>
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => { setRole("nurse"); setError(null) }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
            role === "nurse"
              ? "border-b-2 border-primary text-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Stethoscope className="size-4" />
          Nurse
        </button>
        <button
          type="button"
          onClick={() => { setRole("patient"); setError(null) }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
            role === "patient"
              ? "border-b-2 border-primary text-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserRound className="size-4" />
          Patient
        </button>
      </div>
      <CardHeader>
        <CardTitle>{role === "nurse" ? "Nurse sign in" : "Patient sign in"}</CardTitle>
        <CardDescription>
          {role === "nurse" ? "Sign in with your email" : "Sign in with your username"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {role === "nurse" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Your unique username"
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
