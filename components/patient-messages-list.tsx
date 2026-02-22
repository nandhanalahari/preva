"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import {
  MessageSquare,
  Sparkles,
  Send,
  ChevronDown,
  ChevronUp,
  Circle,
  Reply,
  CheckCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  fetchPatientMessages,
  markMessagesRead,
  replyToPatientMessage,
} from "@/app/actions/patient-messages"

type Message = {
  id: string
  type: "raw" | "analyzed"
  transcript: string
  symptoms?: string[]
  aiSummary?: string
  nurseReply?: string
  nurseReplyAt?: string
  read: boolean
  createdAt: string
}

function MessageCard({
  msg,
  isNurse,
  onReplied,
}: {
  msg: Message
  isNurse: boolean
  onReplied: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  const hasDetails =
    msg.type === "analyzed" && (msg.aiSummary || (msg.symptoms?.length ?? 0) > 0)

  async function handleReply() {
    if (!replyText.trim()) return
    setReplying(true)
    setReplyError(null)
    const res = await replyToPatientMessage(msg.id, replyText)
    setReplying(false)
    if (res.ok) {
      setReplyOpen(false)
      setReplyText("")
      onReplied()
    } else {
      setReplyError(res.error)
    }
  }

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        !msg.read ? "border-primary/30 bg-primary/5" : "bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {!msg.read && (
            <Circle className="mt-1 size-2.5 shrink-0 fill-primary text-primary" />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={
                  msg.type === "analyzed"
                    ? "gap-1 border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    : "gap-1"
                }
              >
                {msg.type === "analyzed" ? (
                  <Sparkles className="size-3" />
                ) : (
                  <Send className="size-3" />
                )}
                {msg.type === "analyzed" ? "AI Analyzed" : "Direct message"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(msg.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground line-clamp-3">
              {msg.transcript}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {hasDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Less" : "Details"}
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </Button>
          )}
        </div>
      </div>

      {expanded && msg.type === "analyzed" && (
        <div className="mt-3 space-y-3 border-t pt-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          {msg.symptoms && msg.symptoms.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Symptoms
              </p>
              <div className="flex flex-wrap gap-1.5">
                {msg.symptoms.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {msg.aiSummary && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                AI Summary
              </p>
              <p className="rounded-md bg-muted/50 p-3 text-sm leading-relaxed text-foreground">
                {msg.aiSummary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Nurse reply display */}
      {msg.nurseReply && (
        <div className="mt-3 border-t pt-3">
          <div className="flex items-start gap-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 p-3">
            <CheckCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Nurse Reply
                </span>
                {msg.nurseReplyAt && (
                  <span className="text-[11px] text-muted-foreground">
                    {format(new Date(msg.nurseReplyAt), "MMM d 'at' h:mm a")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{msg.nurseReply}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nurse reply form */}
      {isNurse && !msg.nurseReply && (
        <div className="mt-3 border-t pt-3">
          {!replyOpen ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setReplyOpen(true)}
            >
              <Reply className="size-3.5" />
              Reply
            </Button>
          ) : (
            <div className="flex flex-col gap-2 animate-in fade-in-0 duration-200">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply to the patient..."
                className="min-h-20 resize-none text-sm"
                disabled={replying}
                autoFocus
              />
              {replyError && (
                <p className="text-xs text-destructive">{replyError}</p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={replying || !replyText.trim()}
                  onClick={handleReply}
                >
                  {replying ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  Send reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={replying}
                  onClick={() => {
                    setReplyOpen(false)
                    setReplyText("")
                    setReplyError(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PatientMessagesList({
  patientId,
  isNurse = true,
}: {
  patientId: string
  isNurse?: boolean
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await fetchPatientMessages(patientId)
      setMessages(data)

      if (isNurse) {
        const hasUnread = data.some((m) => !m.read)
        if (hasUnread) {
          await markMessagesRead(patientId)
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [patientId, isNurse])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MessageSquare className="size-5 text-primary" />
            {isNurse ? "Patient Messages" : "Your Messages"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Spinner className="size-6" />
        </CardContent>
      </Card>
    )
  }

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="size-5 text-primary" />
          {isNurse ? "Patient Messages" : "Your Messages"}
          {isNurse && unreadCount > 0 && (
            <Badge className="ml-1 bg-primary text-primary-foreground">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isNurse
            ? "Voice messages recorded by the patient about their condition."
            : "Your voice messages and nurse replies."}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {isNurse
              ? "No messages from this patient yet."
              : "You haven\u2019t sent any messages yet. Use the recorder above to report your condition."}
          </p>
        ) : (
          messages.map((msg) => (
            <MessageCard key={msg.id} msg={msg} isNurse={isNurse} onReplied={load} />
          ))
        )}
      </CardContent>
    </Card>
  )
}
