"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { format, parse, startOfWeek, endOfWeek, getDay, startOfDay } from "date-fns"
import { enUS } from "date-fns/locale"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import type { ToolbarProps } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import "@/app/calendar/calendar.css"
import { CalendarDays, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchAppointments, createAppointmentAction, updateAppointmentAction, deleteAppointmentAction } from "@/app/actions/appointments"
import type { Appointment } from "@/lib/appointments"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales: { "en-US": enUS },
})

const DnDCalendar = withDragAndDrop(Calendar)

function toDate(v: unknown): Date {
  if (v instanceof Date && !isNaN(v.getTime())) return v
  const d = new Date(typeof v === "string" || typeof v === "number" ? v : String(v))
  return isNaN(d.getTime()) ? new Date() : d
}

function toCalendarEvent(a: Appointment): CalendarEvent {
  return {
    id: a.id,
    title: a.patientName ?? a.title,
    start: toDate(a.start),
    end: toDate(a.end),
    resource: { patientId: a.patientId },
  }
}

function CustomToolbar({ label, onNavigate, onView, view, views }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onNavigate("PREV")} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-display text-lg font-semibold text-foreground min-w-[200px] text-center">
          {label}
        </span>
        <Button variant="outline" size="icon" onClick={() => onNavigate("NEXT")} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
        {views && (Array.isArray(views) ? views.length : Object.keys(views).length) > 1 && (
          <div className="flex rounded-lg border border-border p-1">
            {(Array.isArray(views) ? views : Object.keys(views))
              .slice(0, 4)
              .map((v: string) => (
                <Button
                  key={v}
                  variant={view === v ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onView(v)}
                >
                  {v === "month" ? "Month" : v === "week" ? "Week" : v === "day" ? "Day" : "Agenda"}
                </Button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource?: { patientId: string }
}

type PatientOption = { id: string; name: string }

export function CalendarScreen({ patients, readOnly = false }: { patients: PatientOption[]; readOnly?: boolean }) {
  const [date, setDate] = useState<Date>(() => new Date())
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("week")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [slotStart, setSlotStart] = useState<Date | null>(null)
  const [slotEnd, setSlotEnd] = useState<Date | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deleteEvent, setDeleteEvent] = useState<CalendarEvent | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Single fetch — always widens to cover today → 90 days for the upcoming section
  const loadEvents = useCallback(async (viewStart: Date, viewEnd: Date) => {
    setLoading(true)
    try {
      const now = new Date()
      const today = startOfDay(now)
      const future90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      const fetchStart = viewStart < today ? viewStart : today
      const fetchEnd = viewEnd > future90 ? viewEnd : future90
      const list = await fetchAppointments(fetchStart.toISOString(), fetchEnd.toISOString())
      setEvents(list.map(toCalendarEvent))
    } catch {
      // keep whatever events we had
    } finally {
      setLoading(false)
    }
  }, [])

  const upcoming = useMemo(() => {
    return [...events]
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 20)
  }, [events])

  const handleRangeChange = useCallback(
    (rangeOrDates: { start: Date; end: Date } | Date[] | undefined, _view?: string) => {
      if (!rangeOrDates) return
      let start: Date
      let end: Date
      if (Array.isArray(rangeOrDates)) {
        start = rangeOrDates[0]
        end = rangeOrDates[rangeOrDates.length - 1]
      } else {
        start = rangeOrDates.start
        end = rangeOrDates.end
      }
      if (!start || !end) return
      setRange({ start, end })
      loadEvents(start, end)
    },
    [loadEvents]
  )

  const handleSelectSlot = useCallback((slot: { start: Date; end: Date }) => {
    setSlotStart(slot.start)
    setSlotEnd(slot.end)
    setSelectedPatientId("")
    setCreateError(null)
    setCreateOpen(true)
  }, [])

  const reload = useCallback(() => {
    const s = range?.start ?? startOfWeek(date, { locale: enUS })
    const e = range?.end ?? endOfWeek(date, { locale: enUS })
    return loadEvents(s, e)
  }, [range, date, loadEvents])

  const handleCreateSubmit = useCallback(async () => {
    if (!selectedPatientId || !slotStart || !slotEnd) return
    setCreateLoading(true)
    setCreateError(null)
    try {
      const result = await createAppointmentAction(
        selectedPatientId,
        slotStart.toISOString(),
        slotEnd.toISOString()
      )
      if (result.ok) {
        setCreateOpen(false)
        await reload()
      } else {
        setCreateError(result.error ?? "Failed to create")
      }
    } finally {
      setCreateLoading(false)
    }
  }, [selectedPatientId, slotStart, slotEnd, reload])

  const handleEventDrop = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      const result = await updateAppointmentAction(
        event.id,
        (start instanceof Date ? start : new Date(start)).toISOString(),
        (end instanceof Date ? end : new Date(end)).toISOString()
      )
      if (result.ok) await reload()
    },
    [reload]
  )

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setDeleteEvent(event)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteEvent) return
    setDeleteLoading(true)
    try {
      const result = await deleteAppointmentAction(deleteEvent.id)
      if (result.ok) {
        setDeleteEvent(null)
        await reload()
      }
    } finally {
      setDeleteLoading(false)
    }
  }, [deleteEvent, reload])

  useEffect(() => {
    const now = new Date()
    const start = startOfWeek(now, { locale: enUS })
    const end = endOfWeek(now, { locale: enUS })
    setRange({ start, end })
    loadEvents(start, end)
  }, [loadEvents])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Schedule
        </h1>
        <p className="text-sm text-muted-foreground">
          {readOnly
            ? "View your scheduled appointments."
            : "Drag to reschedule. Click an empty slot to add. Click an event to delete."}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="h-[calc(100vh-16rem)] min-h-[620px]">
          {loading && events.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">Loading calendar…</div>
          ) : (
            <DnDCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              titleAccessor="title"
              date={date}
              view={view}
              onNavigate={(newDate) => setDate(newDate)}
              onView={(newView) => setView(newView)}
              onRangeChange={handleRangeChange}
              onSelectSlot={readOnly ? undefined : handleSelectSlot}
              onSelectEvent={readOnly ? undefined : handleSelectEvent}
              onEventDrop={readOnly ? undefined : handleEventDrop}
              resizable={false}
              selectable={!readOnly}
              draggableAccessor={() => !readOnly}
              popup
              components={{ toolbar: CustomToolbar }}
              views={["month", "week", "day", "agenda"]}
              step={30}
              timeslots={2}
              className="rbc-calendar-custom"
            />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "No upcoming appointments."
              : "No upcoming appointments. Click an empty slot in the calendar to add one."}
          </p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((evt) => (
              <li
                key={evt.id}
                className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary px-3 py-2.5 text-sm text-primary-foreground"
              >
                <span className="shrink-0 text-xs font-semibold opacity-95">
                  {format(evt.start, "EEE, MMM d")}
                </span>
                <span className="shrink-0 text-xs opacity-95">
                  {format(evt.start, "h:mm a")}
                </span>
                <span className="min-w-0 flex-1 break-words font-medium">{evt.title}</span>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                    onClick={() => setDeleteEvent(evt)}
                    aria-label="Delete appointment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!readOnly && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New appointment</DialogTitle>
              <DialogDescription>
                {slotStart && slotEnd
                  ? `Schedule a visit: ${format(slotStart, "EEE, MMM d, h:mm a")} – ${format(slotEnd, "h:mm a")}`
                  : "Choose a patient and time."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Patient</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createLoading}>
                Cancel
              </Button>
              <Button onClick={handleCreateSubmit} disabled={!selectedPatientId || createLoading}>
                {createLoading ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {!readOnly && (
        <AlertDialog open={!!deleteEvent} onOpenChange={(open) => !open && setDeleteEvent(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete appointment</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteEvent && (
                  <>
                    Delete &quot;{deleteEvent.title}&quot; on{" "}
                    {format(deleteEvent.start, "EEE, MMM d, h:mm a")}
                    ? This cannot be undone.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteConfirm()
                }}
                disabled={deleteLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
