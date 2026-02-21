import { Users, AlertTriangle, Calendar, Activity } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { StatCard } from "@/components/stat-card"
import { PatientCard } from "@/components/patient-card"
import { getPatientsSortedByRisk, patients } from "@/lib/data"

export default function DashboardPage() {
  const sorted = getPatientsSortedByRisk()
  const highRisk = patients.filter((p) => p.riskScore >= 40).length
  const avgRisk = Math.round(patients.reduce((s, p) => s + p.riskScore, 0) / patients.length)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Patient Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your active caseload, sorted by risk priority
          </p>
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
          <StatCard label="Avg. Risk Score" value={`${avgRisk}%`} icon={Activity} />
        </div>

        <div className="flex flex-col gap-3">
          {sorted.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      </main>
    </div>
  )
}
