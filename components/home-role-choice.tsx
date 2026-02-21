"use client"

import { useState } from "react"
import Link from "next/link"
import { Stethoscope, UserRound, Volume2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function HomeRoleChoice() {
  const [patientSelected, setPatientSelected] = useState(false)

  if (patientSelected) {
    return (
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-left shadow-lg",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
        )}
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <Volume2 className="size-6 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          You don’t need to log in
        </h2>
        <p className="mb-6 text-muted-foreground">
          Your only touchpoint with Preva is the voice summary from your nurse. After each visit, they can play it for you right there or send it to you as an audio file. No account, no app to manage — we meet you where you are.
        </p>
        <button
          type="button"
          onClick={() => setPatientSelected(false)}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to role selection
        </button>
      </div>
    )
  }

  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
      <Link
        href="/dashboard"
        className={cn(
          "group relative flex flex-col items-center gap-5 rounded-2xl border-2 border-border bg-card p-8 shadow-md transition-all duration-300",
          "hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both"
        )}
        style={{ animationDelay: "0ms" }}
      >
        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-transform duration-300",
            "group-hover:scale-110 group-hover:shadow-primary/30"
          )}
        >
          <Stethoscope className="size-8" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">I’m a Nurse</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dashboard, patients, visit notes
          </p>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Go to dashboard
          <ArrowRight className="size-4" />
        </span>
      </Link>

      <button
        type="button"
        onClick={() => setPatientSelected(true)}
        className={cn(
          "group relative flex flex-col items-center gap-5 rounded-2xl border-2 border-border bg-card p-8 text-center shadow-md transition-all duration-300",
          "hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both"
        )}
        style={{ animationDelay: "80ms" }}
      >
        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300",
            "group-hover:scale-110"
          )}
        >
          <UserRound className="size-8" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">I’m a Patient</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your nurse shares your summary with you
          </p>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Learn more
          <ArrowRight className="size-4" />
        </span>
      </button>
    </div>
  )
}
