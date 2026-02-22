import { redirect } from "next/navigation"
import { Users, AlertTriangle, Calendar, Activity } from "lucide-react"
import { auth } from "@/lib/auth"

export const runtime = "nodejs"
import { AppHeader } from "@/components/app-header"
import { StatCard } from "@/components/stat-card"
import { PatientCard } from "@/components/patient-card"
import { AddPatientButton } from "@/components/add-patient-button"
import { EditableContactInfo } from "@/components/editable-contact-info"
import { getDashboardPatients } from "@/lib/patients"
import { findUserById } from "@/lib/users"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")
  if ((session.user as { role?: string }).role !== "nurse") redirect("/patient-dashboard")
  const nurseUserId = session.user.id
  const [{ patients }, nurseUser] = await Promise.all([
    getDashboardPatients(nurseUserId),
    findUserById(nurseUserId),
  ])
  const sorted = [...patients].sort((a, b) => b.riskScore - a.riskScore)
  const highRisk = patients.filter((p) => p.riskScore >= 40).length
  const avgRisk =
    patients.length > 0
      ? Math.round(patients.reduce((s, p) => s + p.riskScore, 0) / patients.length)
      : 0

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              Patient Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your active caseload, sorted by risk priority
            </p>
          </div>
          <AddPatientButton />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Patients" value={patients.length} icon={Users} />
          <StatCard
            label="High Risk"
            value={highRisk}
            icon={AlertTriangle}
            accent="bg-risk-high"
          />
          <StatCard label="Visits Today" value={2} icon={Calendar} />
          <StatCard label="Avg. Risk Score" value={patients.length ? `${avgRisk}%` : "—"} icon={Activity} />
        </div>

        <div className="flex flex-col gap-3">
          {sorted.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 py-12 text-center text-muted-foreground">
              <p className="font-medium">No patients yet</p>
              <p className="mt-1 text-sm">Add your first patient to get started.</p>
              <AddPatientButton className="mt-4" />
            </div>
          ) : (
            sorted.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))
          )}
        </div>

        <div className="mt-8">
          <EditableContactInfo
            initialContactInfo={nurseUser?.contactInfo}
            title="Your contact information"
            description="This is shared with your patients so they can reach you."
          />
        </div>
      </main>
    </div>
  )
}
