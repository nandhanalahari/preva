"use client"

import { useState } from "react"
import { Stethoscope, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { registerNurse } from "@/app/actions/auth"

const glowClass = "shadow-[0_0_30px_rgba(185,28,28,0.25)] ring-2 ring-primary/30"

type Role = "nurse" | "patient"

export function SignUpForm() {
  const [role, setRole] = useState<Role>("nurse")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleNurseSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim()
    if (!email || !password) return
    setLoading(true)
    try {
      const result = await registerNurse({ email, password, name })
      if (result.ok) {
        setSuccess(true)
      } else {
        setError(result.error ?? "Something went wrong.")
      }
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
          onClick={() => setRole("patient")}
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
        <CardTitle>{role === "nurse" ? "Nurse sign up" : "Patient"}</CardTitle>
        <CardDescription>
          {role === "nurse" ? "Create an account with your email" : "Your nurse creates your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {role === "patient" ? (
          <p className="text-sm text-muted-foreground">
            Patients don’t sign up here. Your nurse will add you to Preva and give you a
            username and password. Use those to sign in on the Sign In page.
          </p>
        ) : success ? (
          <p className="text-sm text-muted-foreground">
            Account created. You can now{" "}
            <a href="/signin" className="font-medium text-primary underline">
              sign in
            </a>
            .
          </p>
        ) : (
          <form onSubmit={handleNurseSubmit} className="flex flex-col gap-4">
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Smith"
                autoComplete="name"
              />
            </div>
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
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
