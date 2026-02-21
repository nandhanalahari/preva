"use client"

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {/* Base gradient */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.99_0.01_27)_0%,oklch(0.97_0.02_27)_50%,oklch(0.98_0.015_27)_100%)]"
        aria-hidden
      />
      {/* Animated soft gradient orbs - health / care feel */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-[20%] top-[10%] h-[60vh] w-[60vh] rounded-full bg-primary/[0.06] blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
          aria-hidden
        />
        <div
          className="absolute -right-[15%] bottom-[15%] h-[50vh] w-[50vh] rounded-full bg-primary/[0.05] blur-3xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
          aria-hidden
        />
        <div
          className="absolute left-1/2 top-1/2 h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "0.5s" }}
          aria-hidden
        />
      </div>
      {/* Subtle grid */}
      <div
        className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=%2724%27_height=%2724%27_viewBox=%270_0_24_24%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Ccircle_cx=%271%27_cy=%271%27_r=%270.5%27_fill=%27oklch(0.52_0.22_27/0.08)%27/%3E%3C/svg%3E')] opacity-70"
        aria-hidden
      />
    </div>
  )
}
