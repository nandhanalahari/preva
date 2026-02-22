import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDashboardPatients } from "@/lib/patients"
import { AppHeader } from "@/components/app-header"
import { CalendarScreen } from "@/components/calendar-screen"

export const runtime = "nodejs"

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")
  if ((session.user as { role?: string }).role !== "nurse") redirect("/patient-dashboard")

  const { patients } = await getDashboardPatients(session.user.id)
  const patientList = patients.map((p) => ({ id: p.id, name: p.name }))

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <CalendarScreen patients={patientList} />
      </main>
    </div>
  )
}
