"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatWindow } from "@/components/chat-window"
import { getUnreadCounts } from "@/app/actions/chat"
import { cn } from "@/lib/utils"

type PatientOption = { id: string; name: string }

export function NurseMessagesScreen({
  patients,
}: {
  patients: PatientOption[]
}) {
  const [selectedId, setSelectedId] = useState<string>(patients[0]?.id ?? "")
  const [unread, setUnread] = useState<Record<string, number>>({})

  const loadUnread = useCallback(async () => {
    if (patients.length === 0) return
    const counts = await getUnreadCounts(patients.map((p) => p.id))
    setUnread(counts)
  }, [patients])

  useEffect(() => {
    loadUnread()
    const interval = setInterval(loadUnread, 10_000)
    return () => clearInterval(interval)
  }, [loadUnread])

  const selected = patients.find((p) => p.id === selectedId)

  if (patients.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center text-muted-foreground">
        <p>No patients yet. Add a patient first to start messaging.</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Patient sidebar */}
      <div className="flex w-64 shrink-0 flex-col rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageSquare className="size-4 text-primary" />
            Conversations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {patients.map((p) => {
            const count = unread[p.id] ?? 0
            return (
              <Button
                key={p.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 text-left h-auto py-2.5 px-3",
                  selectedId === p.id && "bg-accent"
                )}
                onClick={() => {
                  setSelectedId(p.id)
                  setUnread((prev) => {
                    if (!prev[p.id]) return prev
                    const next = { ...prev }
                    delete next[p.id]
                    return next
                  })
                }}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {p.name
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                {count > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {selected ? (
          <ChatWindow
            key={selectedId}
            patientId={selectedId}
            currentUserRole="nurse"
            otherName={selected.name}
            fullHeight
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a patient to start messaging.
          </div>
        )}
      </div>
    </div>
  )
}

export function PatientMessagesScreen({
  patientId,
  nurseName,
}: {
  patientId: string
  nurseName: string
}) {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <ChatWindow
        patientId={patientId}
        currentUserRole="patient"
        otherName={nurseName}
        fullHeight
      />
    </div>
  )
}
