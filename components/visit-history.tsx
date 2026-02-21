import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import type { Visit } from "@/lib/data"
import { getRiskColor, formatDateLong } from "@/lib/data"

export function VisitHistory({ visits }: { visits: Visit[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Visit History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {visits.map((visit) => {
            const beforeColor = getRiskColor(visit.riskScoreBefore)
            const afterColor = getRiskColor(visit.riskScoreAfter)
            const direction = visit.riskScoreAfter > visit.riskScoreBefore
              ? "up"
              : visit.riskScoreAfter < visit.riskScoreBefore
                ? "down"
                : "stable"

            return (
              <div
                key={visit.id}
                className="rounded-lg border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatDateLong(visit.date)}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                      {visit.nurseNote}
                    </p>
                    {visit.symptoms.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {visit.symptoms.map((s) => (
                          <Badge key={s} variant="outline" className="text-[11px] font-normal">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">BP: {visit.vitalsBP}</span>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <span style={{ color: beforeColor }}>{visit.riskScoreBefore}%</span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <span style={{ color: afterColor }}>{visit.riskScoreAfter}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
