"use client"

import { useState, useRef, useCallback } from "react"
import {
  Mic,
  Square,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { transcribeAudio } from "@/app/actions/elevenlabs"
import { submitPatientMessage } from "@/app/actions/patient-messages"

type Step = "idle" | "recording" | "transcribing" | "ready" | "submitting" | "done"

export function PatientVoiceRecorder() {
  const [step, setStep] = useState<Step>("idle")
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ mode: "raw" | "analyzed" } | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        setStep("transcribing")
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const form = new FormData()
        form.append("file", blob, "recording.webm")
        const res = await transcribeAudio(form)
        if (res.ok) {
          setTranscript((prev) => (prev ? `${prev}\n${res.text}` : res.text))
          setStep("ready")
        } else {
          setError(res.error)
          setStep("idle")
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setStep("recording")
    } catch {
      setError("Microphone access is required for voice recording.")
      setStep("idle")
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  const handleSubmit = useCallback(
    async (mode: "raw" | "analyzed") => {
      if (!transcript.trim()) return
      setError(null)
      setStep("submitting")
      const res = await submitPatientMessage(transcript, mode)
      if (res.ok) {
        setResult({ mode })
        setStep("done")
      } else {
        setError(res.error)
        setStep("ready")
      }
    },
    [transcript]
  )

  const handleReset = useCallback(() => {
    setStep("idle")
    setTranscript("")
    setError(null)
    setResult(null)
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Mic className="size-5 text-primary" />
          Report your condition
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Record a voice message about how you're feeling, your symptoms, or anything you want your nurse to know.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        {step === "done" && result && (
          <div className="flex flex-col items-center gap-3 py-6 animate-in fade-in-0 duration-500">
            <CheckCircle2 className="size-10 text-emerald-500" />
            <p className="text-sm font-medium text-foreground">
              {result.mode === "raw"
                ? "Your message has been sent to your nurse."
                : "Your message has been analyzed and sent to your nurse."}
            </p>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Record another message
            </Button>
          </div>
        )}

        {step !== "done" && (
          <>
            {/* Recording controls */}
            {(step === "idle" || step === "recording") && (
              <div className="flex flex-col items-center gap-3 py-4">
                {step === "recording" ? (
                  <Button
                    size="lg"
                    variant="destructive"
                    className="gap-2 rounded-full px-6"
                    onClick={stopRecording}
                  >
                    <Square className="size-4 fill-current" />
                    Stop recording
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="gap-2 rounded-full px-6"
                    onClick={startRecording}
                  >
                    <Mic className="size-4" />
                    Start recording
                  </Button>
                )}
                {step === "recording" && (
                  <div className="flex items-center gap-2">
                    <span className="size-2 animate-pulse rounded-full bg-destructive" />
                    <span className="text-sm text-muted-foreground">Listening...</span>
                  </div>
                )}
              </div>
            )}

            {step === "transcribing" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Spinner className="size-6 text-primary" />
                <p className="text-sm text-muted-foreground">Transcribing your recording...</p>
              </div>
            )}

            {step === "submitting" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Spinner className="size-6 text-primary" />
                <p className="text-sm text-muted-foreground">Sending your message...</p>
              </div>
            )}

            {/* Transcript review */}
            {(step === "ready" || step === "submitting") && (
              <div className="flex flex-col gap-3 animate-in fade-in-0 duration-300">
                <label className="text-sm font-medium text-foreground">
                  Your transcribed message
                </label>
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-28 resize-none"
                  disabled={step === "submitting"}
                  placeholder="Your recorded message appears here..."
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    disabled={step === "submitting"}
                    onClick={startRecording}
                  >
                    <Mic className="size-3.5" />
                    Record more
                  </Button>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="mb-3 text-sm font-medium text-foreground">What would you like to do?</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="flex-1 gap-2"
                      variant="outline"
                      disabled={step === "submitting" || !transcript.trim()}
                      onClick={() => handleSubmit("raw")}
                    >
                      <Send className="size-4" />
                      Send to nurse as-is
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      disabled={step === "submitting" || !transcript.trim()}
                      onClick={() => handleSubmit("analyzed")}
                    >
                      <Sparkles className="size-4" />
                      AI analyze & send
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <p className="text-xs text-muted-foreground">
                      Sends the exact transcription to your nurse without changes.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      AI extracts symptoms and summarizes, then sends both analysis and your original message.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
