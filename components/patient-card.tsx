"use client"

import Link from "next/link"
import { ArrowUpRight, ArrowDownRight, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Patient } from "@/lib/data"
import { getRiskColor, getRiskLevel, getRiskLabel, formatDate } from "@/lib/data"

function RiskRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getRiskColor(score)

  return (
    <div className="relative flex size-[72px] shrink-0 items-center justify-center">
      <svg className="size-full -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32" cy="32" r={radius}
          fill="none" stroke="currentColor"
          className="text-muted/60"
          strokeWidth="5"
        />
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-base font-bold text-foreground">{score}%</span>
    </div>
  )
}

function TrendIndicator({ trend }: { trend: Patient["riskTrend"] }) {
  if (trend === "up") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-risk-high">
        <TrendingUp className="size-3.5" />
        Rising
      </span>
    )
  }
  if (trend === "down") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-risk-low">
        <TrendingDown className="size-3.5" />
        Declining
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Minus className="size-3.5" />
      Stable
    </span>
  )
}

export function PatientCard({ patient }: { patient: Patient }) {
  const riskLevel = getRiskLevel(patient.riskScore)
  const riskLabel = getRiskLabel(patient.riskScore)

  const riskBadgeClass =
    riskLevel === "critical" || riskLevel === "high"
      ? "bg-risk-high/10 text-risk-high border-risk-high/20"
      : riskLevel === "medium"
        ? "bg-risk-medium/10 text-risk-medium border-risk-medium/20"
        : "bg-risk-low/10 text-risk-low border-risk-low/20"

  return (
    <Card className="gap-0 py-0 transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-5 p-5">
        <Avatar className="size-11">
          <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
            {patient.imageInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{patient.name}</h3>
            <span className="shrink-0 text-xs text-muted-foreground">{patient.age}y</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {patient.conditions.map((c) => (
              <Badge key={c} variant="secondary" className="text-[11px] font-normal">
                {c}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-0.5">
            <TrendIndicator trend={patient.riskTrend} />
            <span className="text-xs text-muted-foreground">
              Last visit: {formatDate(patient.lastVisitDate)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <RiskRing score={patient.riskScore} />
          <Badge variant="outline" className={riskBadgeClass}>
            {riskLabel} Risk
          </Badge>
        </div>

        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={`/patients/${patient.id}`}>
            <ArrowRight className="size-4" />
            <span className="sr-only">View {patient.name}</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
