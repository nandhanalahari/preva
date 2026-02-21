"use client"

import { useState, useRef } from "react"
import {
  Mic,
  Sparkles,
  AlertTriangle,
  FileText,
  Volume2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Square,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { RiskGauge } from "@/components/risk-gauge"
import { type Patient } from "@/lib/data"
import { analyzeVisitNote, type VisitAnalysis } from "@/app/actions/analyze-visit-note"
import { synthesizeSpeech, transcribeAudio } from "@/app/actions/elevenlabs"

type AnalysisState = "idle" | "analyzing" | "complete"

const DEFAULT_NOTE =
  "Patient reports significant worsening of shortness of breath over past 2 days, now present at rest. Unable to sleep flat, currently using 3 pillows. Bilateral ankle swelling noticed. States she has been forgetting her evening furosemide dose regularly. BP today 162/96, HR 98, SpO2 93% on room air. Weight 168 lbs, up 4 lbs from last visit. Bilateral basilar crackles noted. 2+ pitting edema bilateral lower extremities."

export function VisitRecorder({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(DEFAULT_NOTE)
  const [state, setState] = useState<AnalysisState>("idle")
  const [showSoapDetails, setShowSoapDetails] = useState(false)
  const [analysis, setAnalysis] = useState<VisitAnalysis | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [playLoading, setPlayLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function handleAnalyze() {
    setAnalyzeError(null)
    setState("analyzing")
    const result = await analyzeVisitNote(note, patient.name, patient.riskScore)
    if (result.ok) {
      setAnalysis(result.analysis)
      setState("complete")
    } else {
      setAnalyzeError(result.error)
      setState("idle")
    }
  }

  async function handleVoiceClick() {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      return
    }
    setAnalyzeError(null)
    setVoiceLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const form = new FormData()
        form.append("file", blob, "recording.webm")
        const res = await transcribeAudio(form)
        if (res.ok && res.text) setNote((prev) => (prev ? `${prev}\n${res.text}` : res.text))
        setVoiceLoading(false)
        setIsRecording(false)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (e) {
      setAnalyzeError("Microphone access needed for voice input.")
      setVoiceLoading(false)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  async function handlePlayAudio() {
    const summary = analysis?.voiceSummary
    if (!summary?.trim()) return
    setPlayLoading(true)
    try {
      const result = await synthesizeSpeech(summary)
      if (!result.ok) {
        setAnalyzeError(result.error)
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

  const handleReset = () => {
    setState("idle")
    setAnalysis(null)
    setAnalyzeError(null)
    setNote(DEFAULT_NOTE)
    setShowSoapDetails(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      stopRecording()
      setTimeout(handleReset, 300)
    }
  }

  const displayAnalysis = analysis ?? null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <ClipboardCheck className="size-4" />
          Record Visit Note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-5 text-primary" />
            Visit Note - {patient.name}
          </DialogTitle>
          <DialogDescription>
            Enter your clinical observations. AI analysis will assess risk changes and generate documentation.
          </DialogDescription>
        </DialogHeader>

        {/* Note input section */}
        <div className="flex flex-col gap-3">
          {analyzeError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {analyzeError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <label htmlFor="visit-note" className="text-sm font-medium text-foreground">
              Clinical Note
            </label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground"
              disabled={state !== "idle" || voiceLoading}
              onClick={handleVoiceClick}
            >
              {voiceLoading && !isRecording ? (
                <Spinner className="size-3.5" />
              ) : isRecording ? (
                <Square className="size-3.5 fill-current" />
              ) : (
                <Mic className="size-3.5" />
              )}
              {isRecording ? "Stop recording" : "Voice"}
            </Button>
          </div>
          <Textarea
            id="visit-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your visit observations here..."
            className="min-h-32 resize-none"
            disabled={state !== "idle"}
          />
          {state === "idle" && (
            <Button
              onClick={handleAnalyze}
              disabled={!note.trim()}
              className="gap-2 self-end"
            >
              <Sparkles className="size-4" />
              Analyze Note
            </Button>
          )}
        </div>

        {/* Analyzing state */}
        {state === "analyzing" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Spinner className="size-8 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Analyzing clinical note...</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Evaluating risk factors and generating documentation
              </p>
            </div>
          </div>
        )}

        {/* Analysis results */}
        {state === "complete" && displayAnalysis && (
          <div className="flex flex-col gap-5 animate-in fade-in-0 duration-500">
            {/* Alert banner */}
            <div className="flex items-center gap-3 rounded-lg border border-risk-high/30 bg-risk-high/5 px-4 py-3">
              <AlertTriangle className="size-5 shrink-0 text-risk-high" />
              <div>
                <p className="text-sm font-semibold text-risk-high">
                  Care Coordinator Alert
                </p>
                <p className="text-xs text-foreground/80">
                  {patient.name} flagged as Critical Risk. Care coordinator has been notified for immediate follow-up.
                </p>
              </div>
            </div>

            <Separator />

            {/* Risk score change */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Updated Risk Assessment
              </p>
              <RiskGauge score={displayAnalysis.newRiskScore} size={140} />
              <p className="text-xs text-muted-foreground">
                Previous: {patient.riskScore}% → Now: {displayAnalysis.newRiskScore}%
              </p>
            </div>

            <Separator />

            {/* Explainability panel */}
            <Card className="gap-0 border-primary/20 py-0 shadow-none">
              <CardHeader className="gap-0 pb-3 pt-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="size-4 text-primary" />
                  AI Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pb-4">
                {displayAnalysis.riskFactors.map((factor, i) => (
                  <div
                    key={i}
                    className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-md border bg-card p-3"
                    style={{ animationDelay: `${i * 150}ms`, animationFillMode: "both" }}
                  >
                    <div className="flex items-start gap-2">
                      <Badge
                        variant="outline"
                        className={
                          factor.severity === "critical"
                            ? "shrink-0 border-risk-critical/30 bg-risk-critical/10 text-risk-critical"
                            : "shrink-0 border-risk-high/30 bg-risk-high/10 text-risk-high"
                        }
                      >
                        {factor.severity === "critical" ? "Critical" : "High"}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-foreground">{factor.factor}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{factor.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SOAP Note */}
            <Card className="gap-0 py-0 shadow-none">
              <CardHeader className="gap-0 pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="size-4 text-primary" />
                    Generated SOAP Note
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setShowSoapDetails(!showSoapDetails)}
                  >
                    {showSoapDetails ? "Collapse" : "Expand"}
                    {showSoapDetails ? (
                      <ChevronUp className="size-3" />
                    ) : (
                      <ChevronDown className="size-3" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {showSoapDetails && (
                <CardContent className="flex flex-col gap-4 pb-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  {(
                    [
                      ["Subjective", displayAnalysis.soapNote.subjective],
                      ["Objective", displayAnalysis.soapNote.objective],
                      ["Assessment", displayAnalysis.soapNote.assessment],
                      ["Plan", displayAnalysis.soapNote.plan],
                    ] as const
                  ).map(([label, content]) => (
                    <div key={label}>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                        {label}
                      </p>
                      <p className="text-sm leading-relaxed text-foreground">{content}</p>
                    </div>
                  ))}
                </CardContent>
              )}
              {!showSoapDetails && (
                <CardContent className="pb-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {displayAnalysis.soapNote.assessment}
                  </p>
                </CardContent>
              )}
            </Card>

            {/* Voice summary */}
            <Card className="gap-0 py-0 shadow-none">
              <CardHeader className="gap-0 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Volume2 className="size-4 text-primary" />
                    Patient Voice Summary
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    disabled={playLoading || !displayAnalysis.voiceSummary?.trim()}
                    onClick={handlePlayAudio}
                  >
                    {playLoading ? <Spinner className="size-3" /> : <Volume2 className="size-3" />}
                    Play Audio
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-sm italic leading-relaxed text-muted-foreground">
                    &ldquo;{displayAnalysis.voiceSummary}&rdquo;
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Audio powered by ElevenLabs
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
