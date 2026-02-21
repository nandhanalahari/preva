"use client"

import { AnimatedBackground } from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Heart,
  Stethoscope,
  Volume2,
  ArrowRight,
  Mic,
  Brain,
  MessageCircle,
  FileText,
  AlertCircle,
  Clock,
  Shield,
  UserRound,
  Headphones,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden pt-16">
      <AnimatedBackground />

      {/* Floating health icons - more visible, staggered */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[8%] top-[18%] animate-bounce text-primary/20" style={{ animationDuration: "2.8s" }}>
          <Heart className="h-16 w-16 fill-primary/20 stroke-primary/30" />
        </div>
        <div className="absolute right-[12%] top-[22%] animate-bounce text-primary/15" style={{ animationDuration: "3.2s", animationDelay: "0.4s" }}>
          <Activity className="h-14 w-14" />
        </div>
        <div className="absolute bottom-[32%] left-[14%] animate-bounce text-primary/15" style={{ animationDuration: "3.5s", animationDelay: "0.8s" }}>
          <Stethoscope className="h-12 w-12" />
        </div>
        <div className="absolute bottom-[28%] right-[10%] animate-bounce text-primary/20" style={{ animationDuration: "3s", animationDelay: "0.2s" }}>
          <Volume2 className="h-14 w-14" />
        </div>
        <div className="absolute left-1/2 top-[12%] -translate-x-1/2 animate-bounce text-primary/10" style={{ animationDuration: "4s", animationDelay: "1s" }}>
          <Activity className="h-10 w-10" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex flex-1 flex-col items-center justify-center px-4 text-center">
        {/* Badge - bolder */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-white/90 px-5 py-2.5 text-sm font-semibold text-primary shadow-lg shadow-primary/10 backdrop-blur-sm">
          <Activity className="h-4 w-4" />
          <span>Predictive Home Health</span>
        </div>

        {/* Headline - bigger impact */}
        <h1 className="mb-6 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
          <span className="text-balance block">Get ahead of</span>
          <span className="mt-2 block bg-gradient-to-r from-primary via-primary to-primary/90 bg-clip-text text-transparent drop-shadow-sm">
            the problem.
          </span>
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Preva helps home health nurses cut paperwork, spot risk early, and give
          patients a voice summary they actually understand.
        </p>

        {/* How it works - one line */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:gap-6">
          <span className="flex items-center gap-2 font-medium">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mic className="size-4" />
            </span>
            Nurse speaks
          </span>
          <span className="text-primary/50">→</span>
          <span className="flex items-center gap-2 font-medium">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Brain className="size-4" />
            </span>
            AI analyzes
          </span>
          <span className="text-primary/50">→</span>
          <span className="flex items-center gap-2 font-medium">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircle className="size-4" />
            </span>
            Patient hears
          </span>
        </div>

        {/* CTAs - more prominent */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/dashboard">
            <Button
              size="lg"
              className={cn(
                "gap-2 bg-primary px-10 py-6 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30",
                "transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/25"
              )}
            >
              I’m a Nurse
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/signin?role=patient">
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "gap-2 border-2 border-primary/40 bg-white/80 px-10 py-6 text-base font-semibold backdrop-blur-sm",
                "transition-all duration-200 hover:scale-[1.02] hover:border-primary hover:bg-primary/10 hover:text-primary"
              )}
            >
              I’m a Patient
              <Volume2 className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Stats - card style with hover */}
        <div className="mt-20 mb-24 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="group rounded-2xl border-2 border-primary/15 bg-white/80 px-8 py-6 shadow-lg shadow-primary/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <p className="text-3xl font-bold text-primary sm:text-4xl">40%</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Less time on paperwork</p>
          </div>
          <div className="group rounded-2xl border-2 border-primary/15 bg-white/80 px-8 py-6 shadow-lg shadow-primary/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <p className="text-3xl font-bold text-primary sm:text-4xl">Early</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Risk detection</p>
          </div>
          <div className="group rounded-2xl border-2 border-primary/15 bg-white/80 px-8 py-6 shadow-lg shadow-primary/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <p className="text-3xl font-bold text-primary sm:text-4xl">Voice</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Patient summaries</p>
          </div>
        </div>
      </div>

      {/* How it works - 3 steps */}
      <div className="relative z-10 border-t border-primary/10 bg-white/70 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How Preva works
          </h2>
          <p className="mx-auto mb-14 max-w-2xl text-center text-muted-foreground">
            From visit to voice summary in one flow. No extra apps, no extra logins.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group flex flex-col items-center rounded-2xl border-2 border-primary/15 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
              <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Mic className="size-8" />
              </span>
              <h3 className="mb-2 text-xl font-semibold text-foreground">1. Nurse speaks</h3>
              <p className="text-muted-foreground">
                During the visit, the nurse records observations in plain language—vitals, symptoms, meds—like leaving a voicemail.
              </p>
            </div>
            <div className="group flex flex-col items-center rounded-2xl border-2 border-primary/15 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
              <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Brain className="size-8" />
              </span>
              <h3 className="mb-2 text-xl font-semibold text-foreground">2. AI analyzes</h3>
              <p className="text-muted-foreground">
                Preva extracts data, updates risk scores, drafts the clinical note, and flags the care team if something needs attention.
              </p>
            </div>
            <div className="group flex flex-col items-center rounded-2xl border-2 border-primary/15 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
              <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <MessageCircle className="size-8" />
              </span>
              <h3 className="mb-2 text-xl font-semibold text-foreground">3. Patient hears</h3>
              <p className="text-muted-foreground">
                A warm, plain-English voice summary is ready to play or send—so the patient knows what matters without the jargon.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* For nurses / For patients - two columns */}
      <div className="relative z-10 border-t border-primary/10 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="rounded-2xl border-2 border-primary/15 bg-white/80 p-8 shadow-lg backdrop-blur-sm lg:p-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Stethoscope className="size-6" />
                </span>
                <h3 className="text-2xl font-bold text-foreground">For nurses</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: FileText, text: "Speak your visit note—no typing. Notes and risk updates happen automatically." },
                  { icon: Clock, text: "Spend less time on paperwork and more time with patients." },
                  { icon: AlertCircle, text: "See risk scores and trends so you know who needs attention first." },
                  { icon: Shield, text: "Clear explainability: understand why a risk score changed before you leave the home." },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-muted-foreground">
                    <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-primary/15 bg-white/80 p-8 shadow-lg backdrop-blur-sm lg:p-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRound className="size-6" />
                </span>
                <h3 className="text-2xl font-bold text-foreground">For patients</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: Headphones, text: "Listen to a short voice summary after each visit—in plain English, not medical jargon." },
                  { icon: Heart, text: "Feel that someone’s watching out for you between visits." },
                  { icon: Shield, text: "No app to download, no account to manage. Your nurse shares the summary with you." },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-muted-foreground">
                    <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 border-t border-primary/10 bg-primary/5 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Sign in as a nurse to open your dashboard, or as a patient to hear your care in your own words.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                I’m a Nurse
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/signin?role=patient">
              <Button variant="outline" size="lg" className="gap-2 border-primary/40 hover:bg-primary/10 hover:text-primary">
                I’m a Patient
                <Volume2 className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-primary/10 bg-white/60 py-5 text-center text-sm font-medium text-muted-foreground backdrop-blur-sm">
        Built for home health care. Get ahead of the problem.
      </footer>
    </section>
  )
}
