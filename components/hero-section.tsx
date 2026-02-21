"use client"

import { useState } from "react"
import { AnimatedBackground } from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import { Activity, Heart, Stethoscope, Volume2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const [patientSelected, setPatientSelected] = useState(false)

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden pt-16">
      <AnimatedBackground />

      {/* Floating health-themed elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute left-[10%] top-[20%] animate-bounce text-primary/10"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        >
          <Heart className="h-14 w-14 fill-current" />
        </div>
        <div
          className="absolute right-[15%] top-[28%] animate-bounce text-primary/10"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        >
          <Activity className="h-12 w-12" />
        </div>
        <div
          className="absolute bottom-[28%] left-[18%] animate-bounce text-primary/10"
          style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
        >
          <Stethoscope className="h-10 w-10" />
        </div>
        <div
          className="absolute bottom-[25%] right-[12%] animate-bounce text-primary/10"
          style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
        >
          <Volume2 className="h-12 w-12" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary backdrop-blur-sm">
          <Activity className="h-4 w-4" />
          <span>Predictive Home Health</span>
        </div>

        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          <span className="text-balance">Get ahead of</span>
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            the problem.
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Preva helps home health nurses cut paperwork, spot risk early, and give
          patients a voice summary they actually understand. No extra logins — just better care.
        </p>

        {patientSelected ? (
          <div
            className={cn(
              "w-full max-w-lg rounded-2xl border border-border bg-card/80 p-8 text-left shadow-lg backdrop-blur-sm",
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
              Your only touchpoint with Preva is the voice summary from your nurse. After each visit, they can play it for you right there or send it as an audio file. No account, no app to manage — we meet you where you are.
            </p>
            <Button
              variant="ghost"
              className="text-primary hover:bg-primary/10"
              onClick={() => setPatientSelected(false)}
            >
              ← Back to role selection
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="gap-2 bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
              >
                I’m a Nurse
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-primary/30 px-8 text-foreground hover:bg-primary/10 hover:text-primary"
              onClick={() => setPatientSelected(true)}
            >
              I’m a Patient
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Stats */}
        {!patientSelected && (
          <div className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-6">
            <div className="rounded-xl border border-border/50 bg-card/50 px-6 py-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-primary sm:text-3xl">40%</p>
              <p className="text-sm text-muted-foreground">Less time on paperwork</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 px-6 py-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-primary sm:text-3xl">Early</p>
              <p className="text-sm text-muted-foreground">Risk detection</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 px-6 py-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-primary sm:text-3xl">Voice</p>
              <p className="text-sm text-muted-foreground">Patient summaries</p>
            </div>
          </div>
        )}
      </div>

      <footer className="relative z-10 border-t border-border/60 bg-background/60 py-4 text-center text-xs text-muted-foreground">
        Built for home health care.
      </footer>
    </section>
  )
}
