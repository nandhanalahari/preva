import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Hospital, User, KeyRound } from "lucide-react"
import { auth } from "@/lib/auth"

export const runtime = "nodejs"
import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { RiskGauge } from "@/components/risk-gauge"
import { RiskTrendChart } from "@/components/risk-trend-chart"
import { BPTrendChart } from "@/components/bp-trend-chart"
import { MedicationList } from "@/components/medication-list"
import { VisitHistory } from "@/components/visit-history"
import { VisitRecorder } from "@/components/visit-recorder"
import { PatientContactInfo, PatientCredentials } from "@/components/patient-contact-credentials"
import { getPatientDetail } from "@/lib/patients"
import { getPatientUserByPatientId } from "@/lib/users"

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")
  if ((session.user as { role?: string }).role !== "nurse") redirect("/patient-dashboard")

  const { id } = await params
  const detail = await getPatientDetail(id)
  if (!detail) notFound()

  const patientUser = await getPatientUserByPatientId(id)
  const { patient, riskHistory, bpHistory, medications, visits } = detail

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

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
            <VisitRecorder patient={patient} />
          </div>
        </div>

        {/* Contact info & credentials */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="size-4" />
              Patient contact information
            </h2>
            <PatientContactInfo contactInfo={patientUser?.contactInfo} />
          </div>
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <KeyRound className="size-4" />
              Login credentials
            </h2>
            <PatientCredentials username={patientUser?.username} />
          </div>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <RiskTrendChart data={riskHistory} />
          <BPTrendChart data={bpHistory} />
        </div>

        <div className="mb-6">
          <MedicationList medications={medications} />
        </div>

        <div className="mb-6">
          <VisitHistory visits={visits} />
        </div>
      </main>
    </div>
  )
}
