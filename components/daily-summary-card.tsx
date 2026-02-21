"use client"

import { useState } from "react"
import { Sparkles, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { generateDailySummary } from "@/app/actions/generate-daily-summary"
import { synthesizeSpeech } from "@/app/actions/elevenlabs"

export function DailySummaryCard({ patientId }: { patientId: string }) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [playLoading, setPlayLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setError(null)
    setLoading(true)
    try {
      const result = await generateDailySummary(patientId)
      if (result.ok) {
        setSummary(result.summary)
      } else {
        setError(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handlePlay() {
    if (!summary?.trim()) return
    setError(null)
    setPlayLoading(true)
    try {
      const result = await synthesizeSpeech(summary, { forPatientId: patientId })
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
      setPlayLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Your day at a glance
        </CardTitle>
        <CardDescription>
          Get a short summary of what you need to do today: medications, risk level, and simple reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          variant="default"
          size="sm"
          className="w-fit gap-2"
          disabled={loading}
          onClick={handleGenerate}
        >
          {loading ? <Spinner className="size-4" /> : <Sparkles className="size-4" />}
          Get today&apos;s summary
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {summary && (
          <div className="space-y-2">
            <div className="rounded-md border bg-muted/30 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {summary}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-fit gap-2"
              disabled={playLoading}
              onClick={handlePlay}
            >
              {playLoading ? <Spinner className="size-4" /> : <Volume2 className="size-4" />}
              Play summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}