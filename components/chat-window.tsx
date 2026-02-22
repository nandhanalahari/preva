"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { format } from "date-fns"
import { MessageSquare, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  sendChatMessage,
  fetchChatMessages,
  markChatRead,
} from "@/app/actions/chat"

type Msg = {
  id: string
  senderId: string
  senderRole: "nurse" | "patient"
  text: string
  read: boolean
  createdAt: string
}

const POLL_MS = 5_000

export function ChatWindow({
  patientId,
  currentUserRole,
  otherName,
  fullHeight = false,
}: {
  patientId: string
  currentUserRole: "nurse" | "patient"
  otherName: string
  fullHeight?: boolean
}) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const latestRef = useRef<string | undefined>(undefined)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    })
  }, [])

  const load = useCallback(
    async (incremental = false) => {
      try {
        const msgs = await fetchChatMessages(
          patientId,
          incremental ? latestRef.current : undefined
        )
        if (incremental && msgs.length > 0) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id))
            const fresh = msgs.filter((m) => !ids.has(m.id))
            return fresh.length ? [...prev, ...fresh] : prev
          })
          latestRef.current = msgs[msgs.length - 1].createdAt
          scrollToBottom()
        } else if (!incremental) {
          setMessages(msgs)
          if (msgs.length > 0) latestRef.current = msgs[msgs.length - 1].createdAt
          scrollToBottom()
        }
        await markChatRead(patientId)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    },
    [patientId, scrollToBottom]
  )

  useEffect(() => {
    load(false)
    const interval = setInterval(() => load(true), POLL_MS)
    return () => clearInterval(interval)
  }, [load])

  const handleSend = useCallback(async () => {
    const text = draft.trim()
    if (!text) return
    setSending(true)
    setDraft("")
    const tmpId = `tmp-${Date.now()}`
    const optimistic: Msg = {
      id: tmpId,
      senderId: "",
      senderRole: currentUserRole,
      text,
      read: false,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    scrollToBottom()

    const result = await sendChatMessage(patientId, text)
    setMessages((prev) => prev.filter((m) => m.id !== tmpId))
    if (result.ok) {
      await load(true)
    }
    setSending(false)
  }, [draft, patientId, currentUserRole, scrollToBottom, load])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const chatAreaClass = fullHeight
    ? "flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg border bg-muted/20 p-3"
    : "flex h-80 flex-col gap-2 overflow-y-auto rounded-lg border bg-muted/20 p-3"

  return (
    <Card className={`flex flex-col ${fullHeight ? "flex-1" : ""}`}>
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="size-5 text-primary" />
          Messages with {otherName}
        </CardTitle>
      </CardHeader>
      <CardContent className={`flex flex-col gap-3 pb-4 ${fullHeight ? "flex-1 min-h-0" : ""}`}>
        <div ref={scrollRef} className={chatAreaClass}>
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="size-5" />
            </div>
          ) : messages.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderRole === currentUserRole
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                      isMine
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-card border"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherName}...`}
            disabled={sending}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            aria-label="Send message"
          >
            {sending ? <Spinner className="size-4" /> : <Send className="size-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
