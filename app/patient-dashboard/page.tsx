import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export const runtime = "nodejs"
import { findUserById } from "@/lib/users"
import { getPatientDetail } from "@/lib/patients"
import { Navbar } from "@/components/navbar"
import { PatientContactInfo } from "@/components/patient-contact-credentials"
import { RiskGauge } from "@/components/risk-gauge"
import { RiskTrendChart } from "@/components/risk-trend-chart"
import { BPTrendChart } from "@/components/bp-trend-chart"
import { MedicationList } from "@/components/medication-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayVisitSummaryCard } from "@/components/play-visit-summary-card"
import { DailySummaryCard } from "@/components/daily-summary-card"
import { MyAppointments } from "@/components/my-appointments"
import { Phone, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { getRiskLabel } from "@/lib/data"
import { PatientVoiceRecorder } from "@/components/patient-voice-recorder"
import { EditableContactInfo } from "@/components/editable-contact-info"
import { RiskReasoning } from "@/components/risk-reasoning"

export default async function PatientDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")
  if ((session.user as { role?: string }).role !== "patient") redirect("/dashboard")

  const user = await findUserById(session.user.id)
  if (!user?.patientId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-12 text-center">
          <p className="text-muted-foreground">No patient record linked to your account.</p>
        </main>
      </div>
    )
  }

  const detail = await getPatientDetail(user.patientId)
  const nurseUser = user.addedByUserId ? await findUserById(user.addedByUserId) : null
  const nurseContact = nurseUser?.contactInfo ?? null

  if (!detail) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-12 text-center">
          <p className="text-muted-foreground">Patient record not found.</p>
        </main>
      </div>
    )
  }

  const { patient, riskHistory, bpHistory, medications, lastVoiceSummary, lastVoiceSummaryAt } = detail

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-semibold text-foreground">
          Welcome back, {patient.name}
        </h1>
        <p className="mb-8 text-muted-foreground">
          Here are your diagnostics and care team contact.
        </p>

        {/* Risk score — prominent at the top */}
        <div className="mb-8 grid gap-6 md:grid-cols-[1fr_auto]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Risk at a glance
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {patient.riskScore}%
              </span>
              <Badge
                variant="secondary"
                className={
                  patient.riskTrend === "up"
                    ? "border-risk-high/40 bg-risk-high/10 text-risk-high"
                    : patient.riskTrend === "down"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                }
              >
                {patient.riskTrend === "up" ? (
                  <TrendingUp className="mr-1 size-3.5" />
                ) : patient.riskTrend === "down" ? (
                  <TrendingDown className="mr-1 size-3.5" />
                ) : (
                  <Minus className="mr-1 size-3.5" />
                )}
                {patient.riskTrend === "up" ? "Trending up" : patient.riskTrend === "down" ? "Trending down" : "Stable"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getRiskLabel(patient.riskScore)} · 30-day view
              </span>
              <div className="w-full">
                <RiskReasoning patientId={patient.id} />
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center">
            <RiskGauge score={patient.riskScore} />
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <PlayVisitSummaryCard
            patientId={patient.id}
            lastVoiceSummaryAt={lastVoiceSummaryAt ?? null}
            lastVoiceSummaryPreview={lastVoiceSummary ?? null}
          />
          <DailySummaryCard patientId={patient.id} />
        </div>

        <div className="mb-8">
          <PatientVoiceRecorder />
        </div>

        <div className="mb-8">
          <MyAppointments />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <RiskTrendChart data={riskHistory} />
          <BPTrendChart data={bpHistory} />
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Your medications</h2>
          <MedicationList medications={medications} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <EditableContactInfo
            initialContactInfo={user.contactInfo}
            title="Your contact information"
            description="Keep this up to date so your nurse can reach you."
          />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="size-5" />
                Your nurse&apos;s contact information
              </CardTitle>
              <CardDescription>
                Use this to reach your care team between visits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientContactInfo contactInfo={nurseContact ?? undefined} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
