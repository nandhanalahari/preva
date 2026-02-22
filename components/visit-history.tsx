"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown, ChevronUp, FileText, Sparkles, Volume2 } from "lucide-react"
import type { Visit } from "@/lib/data"
import { getRiskColor, formatDateLong } from "@/lib/data"

function VisitCard({ visit }: { visit: Visit }) {
  const [expanded, setExpanded] = useState(false)
  const beforeColor = getRiskColor(visit.riskScoreBefore)
  const afterColor = getRiskColor(visit.riskScoreAfter)

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {formatDateLong(visit.date)}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {visit.soapNote?.assessment || visit.nurseNote || "Visit recorded"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span style={{ color: beforeColor }}>{visit.riskScoreBefore}%</span>
            <ArrowRight className="size-3 text-muted-foreground" />
            <span style={{ color: afterColor }}>{visit.riskScoreAfter}%</span>
          </div>
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {visit.nurseNote && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Clinical Note
              </p>
              <p className="text-sm leading-relaxed text-foreground">{visit.nurseNote}</p>
            </div>
          )}

          {visit.riskFactors && visit.riskFactors.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-3" />
                Risk Factors
              </p>
              <div className="flex flex-col gap-2">
                {visit.riskFactors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md border bg-muted/30 p-2.5">
                    <Badge
                      variant="outline"
                      className={
                        f.severity === "critical"
                          ? "shrink-0 border-risk-critical/30 bg-risk-critical/10 text-risk-critical text-[10px]"
                          : "shrink-0 border-risk-high/30 bg-risk-high/10 text-risk-high text-[10px]"
                      }
                    >
                      {f.severity}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.factor}</p>
                      <p className="text-xs text-muted-foreground">{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visit.soapNote && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="size-3" />
                SOAP Note
              </p>
              <div className="grid gap-2">
                {(
                  [
                    ["S", visit.soapNote.subjective],
                    ["O", visit.soapNote.objective],
                    ["A", visit.soapNote.assessment],
                    ["P", visit.soapNote.plan],
                  ] as const
                ).map(([label, content]) =>
                  content ? (
                    <div key={label} className="flex gap-2">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                        {label}
                      </span>
                      <p className="text-sm leading-relaxed text-foreground">{content}</p>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {visit.voiceSummary && (
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Volume2 className="size-3" />
                Patient Summary
              </p>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-sm italic leading-relaxed text-muted-foreground">
                  &ldquo;{visit.voiceSummary}&rdquo;
                </p>
              </div>
            </div>
          )}

          {visit.vitalsBP && (
            <p className="text-xs text-muted-foreground">BP: {visit.vitalsBP}</p>
          )}

          {visit.symptoms && visit.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visit.symptoms.map((s) => (
                <Badge key={s} variant="outline" className="text-[11px] font-normal">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function VisitHistory({ visits }: { visits: Visit[] }) {
  if (visits.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No visits recorded yet. Use &ldquo;Record Visit Note&rdquo; to add one.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Visit History ({visits.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {visits.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
