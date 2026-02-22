"use client"

import { useState, useEffect, useCallback } from "react"
import { CalendarClock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAppointments } from "@/app/actions/appointments"
import type { Appointment } from "@/lib/appointments"
import { format, isToday, isTomorrow } from "date-fns"

const REFETCH_MS = 30_000

function safeDate(v: unknown): Date {
  if (v instanceof Date && !isNaN(v.getTime())) return v
  const d = new Date(typeof v === "string" || typeof v === "number" ? v : String(v))
  return isNaN(d.getTime()) ? new Date() : d
}

export function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const now = new Date()
      const start = new Date(now)
      start.setMonth(start.getMonth() - 3)
      const end = new Date(now)
      end.setMonth(end.getMonth() + 3)
      const list = await fetchAppointments(start.toISOString(), end.toISOString())
      setAppointments(
        list.map((a) => ({
          ...a,
          start: safeDate(a.start),
          end: safeDate(a.end),
        }))
      )
      setError(null)
    } catch {
      setError("Could not load appointments.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const t = setInterval(load, REFETCH_MS)
    return () => clearInterval(t)
  }, [load])

  const upcoming = [...appointments]
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-5 text-primary" />
          My appointments
        </CardTitle>
        <CardDescription>
          Your scheduled visits. Updates automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {isToday(a.start) ? "Today" : isTomorrow(a.start) ? "Tomorrow" : format(a.start, "EEE, MMM d")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(a.start, "h:mm a")} – {format(a.end, "h:mm a")}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{a.title}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
