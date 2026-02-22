"use client"

import { useState, useCallback } from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { generateRiskReasoning } from "@/app/actions/risk-reasoning"

export function RiskReasoning({ patientId }: { patientId: string }) {
  const [reasoning, setReasoning] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await generateRiskReasoning(patientId)
      if (result.ok) {
        setReasoning(result.reasoning)
      } else {
        setError(result.error)
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }, [patientId])

  if (!reasoning && !loading && !error) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-2 gap-1.5 text-xs"
        onClick={generate}
      >
        <Sparkles className="size-3.5 text-primary" />
        AI Risk Reasoning
      </Button>
    )
  }

  return (
    <div className="mt-3 animate-in fade-in-0 duration-500">
      {loading && (
        <div className="flex items-center gap-2 py-2">
          <Spinner className="size-4 text-primary" />
          <span className="text-xs text-muted-foreground">Analyzing risk factors...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-destructive">{error}</p>
          <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={generate}>
            <RefreshCw className="size-3" />
            Retry
          </Button>
        </div>
      )}

      {reasoning && !loading && (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              AI Risk Reasoning
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-xs text-muted-foreground"
              onClick={generate}
              disabled={loading}
            >
              <RefreshCw className="size-3" />
              Refresh
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{reasoning}</p>
        </div>
      )}
    </div>
  )
}
