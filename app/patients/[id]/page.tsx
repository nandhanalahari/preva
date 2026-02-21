import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Hospital } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RiskGauge } from "@/components/risk-gauge"
import { RiskTrendChart } from "@/components/risk-trend-chart"
import { BPTrendChart } from "@/components/bp-trend-chart"
import { MedicationList } from "@/components/medication-list"
import { VisitHistory } from "@/components/visit-history"
import { VisitRecorder } from "@/components/visit-recorder"
import { getPatientDetail } from "@/lib/data"

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = getPatientDetail(id)

  if (!detail) notFound()

  const { patient, riskHistory, bpHistory, medications, visits } = detail

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        {/* Patient header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              {patient.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {patient.age} years old
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {patient.conditions.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
            {patient.priorHospitalizations > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Hospital className="size-3.5" />
                {patient.priorHospitalizations} prior hospitalization{patient.priorHospitalizations > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 sm:items-end">
            <RiskGauge score={patient.riskScore} />
            {patient.id === "mary-thompson" && (
              <VisitRecorder patient={patient} />
            )}
          </div>
        </div>

        {/* Charts grid */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <RiskTrendChart data={riskHistory} />
          <BPTrendChart data={bpHistory} />
        </div>

        {/* Medication Adherence */}
        <div className="mb-6">
          <MedicationList medications={medications} />
        </div>

        {/* Visit History */}
        <div className="mb-6">
          <VisitHistory visits={visits} />
        </div>
      </main>
    </div>
  )
}
