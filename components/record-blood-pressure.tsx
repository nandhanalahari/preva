"use client"

import { useState } from "react"
import { Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { recordBloodPressure } from "@/app/actions/record-bp"

export function RecordBloodPressure({ patientId }: { patientId: string }) {
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const s = parseInt(systolic, 10)
    const d = parseInt(diastolic, 10)
    if (Number.isNaN(s) || Number.isNaN(d)) {
      setError("Enter valid numbers for systolic and diastolic.")
      return
    }
    setLoading(true)
    try {
      const result = await recordBloodPressure(patientId, s, d)
      if (result.ok) {
        setSystolic("")
        setDiastolic("")
      } else {
        setError(result.error ?? "Failed to record.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Activity className="size-4" />
          Record blood pressure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bp-systolic" className="text-xs">
              Systolic
            </Label>
            <Input
              id="bp-systolic"
              type="number"
              min={60}
              max={300}
              placeholder="120"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-20"
            />
          </div>
          <span className="text-muted-foreground pb-2">/</span>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bp-diastolic" className="text-xs">
              Diastolic
            </Label>
            <Input
              id="bp-diastolic"
              type="number"
              min={40}
              max={200}
              placeholder="80"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-20"
            />
          </div>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Saving…" : "Record"}
          </Button>
          {error && (
            <p className="w-full text-sm text-destructive">{error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
