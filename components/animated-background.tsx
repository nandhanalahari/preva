"use client"

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {/* Deep gradient base */}
      <div
        className="absolute inset-0 bg-[linear-gradient(165deg,oklch(0.985_0.008_27)_0%,oklch(0.97_0.02_27)_35%,oklch(0.96_0.03_27)_70%,oklch(0.98_0.015_27)_100%)]"
        aria-hidden
      />
      {/* Animated gradient orbs - stronger, more visible */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-[15%] top-[5%] h-[70vmin] w-[70vmin] rounded-full bg-primary/[0.12] blur-[80px] animate-pulse"
          style={{ animationDuration: "5s" }}
          aria-hidden
        />
        <div
          className="absolute -right-[10%] bottom-[10%] h-[55vmin] w-[55vmin] rounded-full bg-primary/[0.1] blur-[70px] animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "1.5s" }}
          aria-hidden
        />
        <div
          className="absolute left-1/2 top-1/2 h-[45vmin] w-[45vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[60px] animate-pulse"
          style={{ animationDuration: "7s", animationDelay: "0.8s" }}
          aria-hidden
        />
      </div>
      {/* Diagonal accent stripe */}
      <div
        className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rotate-12 rounded-3xl border border-primary/10 bg-primary/[0.03]"
        aria-hidden
      />
      <div
        className="absolute -left-24 top-1/3 h-[280px] w-[280px] -rotate-12 rounded-3xl border border-primary/10 bg-primary/[0.02]"
        aria-hidden
      />
      {/* Dot grid - finer and more visible */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.52 0.22 27 / 0.15) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
    </div>
  )
}
