"use client"

import { useState, useEffect, useCallback } from "react"
import { CalendarClock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAppointments } from "@/app/actions/appointments"
import type { Appointment } from "@/lib/appointments"
import { format, isToday, isTomorrow } from "date-fns"

const REFETCH_MS = 60_000

export function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setMonth(end.getMonth() + 3)
    const list = await fetchAppointments(start, end)
    setAppointments(
      list.map((a) => ({
        ...a,
        start: a.start instanceof Date ? a.start : new Date(a.start),
        end: a.end instanceof Date ? a.end : new Date(a.end),
      }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const t = setInterval(load, REFETCH_MS)
    return () => clearInterval(t)
  }, [load])

  const upcoming = appointments
    .filter((a) => a.start >= new Date())
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
          Your scheduled visits. Updates when your nurse reschedules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
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
