"use client"

import { useState } from "react"
import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { synthesizePatientSummary } from "@/app/actions/elevenlabs"
import { formatDateLong } from "@/lib/data"

export function PlayVisitSummaryCard({
  patientId,
  lastVoiceSummaryAt,
  lastVoiceSummaryPreview,
}: {
  patientId: string
  lastVoiceSummaryAt: string | null | undefined
  lastVoiceSummaryPreview?: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePlay() {
    setError(null)
    setLoading(true)
    try {
      const result = await synthesizePatientSummary(patientId)
      if (!result.ok) {
        setError(result.error)
        return
      }
      const binary = Uint8Array.from(atob(result.audioBase64), (c) => c.charCodeAt(0))
      const blob = new Blob([binary], { type: "audio/mpeg" })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      await audio.play()
      audio.onended = () => URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  const hasSummary = !!lastVoiceSummaryAt

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="size-5 text-primary" />
          Latest visit summary
        </CardTitle>
        <CardDescription>
          {hasSummary
            ? `From ${formatDateLong(lastVoiceSummaryAt)} — listen to what your nurse shared after your last visit.`
            : "After your next visit, your nurse can record a short summary you can play here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {lastVoiceSummaryPreview && (
          <p className="rounded-md bg-muted/50 p-3 text-sm italic leading-relaxed text-muted-foreground line-clamp-3">
            &ldquo;{lastVoiceSummaryPreview}&rdquo;
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-fit gap-2"
          disabled={!hasSummary || loading}
          onClick={handlePlay}
        >
          {loading ? <Spinner className="size-4" /> : <Volume2 className="size-4" />}
          {hasSummary ? "Play summary" : "No summary yet"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
