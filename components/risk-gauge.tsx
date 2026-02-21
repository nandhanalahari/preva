"use client"

import { useEffect, useState } from "react"
import { getRiskColor, getRiskLabel } from "@/lib/data"

interface RiskGaugeProps {
  score: number
  size?: number
  animated?: boolean
}

export function RiskGauge({ score, size = 160, animated = true }: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score)
      return
    }
    const timeout = setTimeout(() => setDisplayScore(score), 100)
    return () => clearTimeout(timeout)
  }, [score, animated])

  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayScore / 100) * circumference
  const color = getRiskColor(displayScore)
  const label = getRiskLabel(displayScore)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="size-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted/50"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease-out, stroke 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{displayScore}%</span>
          <span className="text-xs font-medium text-muted-foreground">Risk Score</span>
        </div>
      </div>
      <span
        className="rounded-full px-3 py-1 text-xs font-semibold"
        style={{
          backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
          color,
        }}
      >
        {label} Risk
      </span>
    </div>
  )
}
