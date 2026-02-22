import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export const runtime = "nodejs"
import { findUserById } from "@/lib/users"
import { getDashboardPatients } from "@/lib/patients"
import { Navbar } from "@/components/navbar"
import { NurseMessagesScreen, PatientMessagesScreen } from "@/components/messages-screen"

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const role = (session.user as { role?: string }).role
  const user = await findUserById(session.user.id)

  if (role === "nurse") {
    const { patients } = await getDashboardPatients(session.user.id)
    const patientList = patients.map((p) => ({ id: p.id, name: p.name }))

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-6">
          <NurseMessagesScreen patients={patientList} />
        </main>
      </div>
    )
  }

  if (role === "patient") {
    if (!user?.patientId) {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="mx-auto max-w-3xl px-4 py-12 text-center">
            <p className="text-muted-foreground">No patient record linked to your account.</p>
          </main>
        </div>
      )
    }

    const nurseUser = user.addedByUserId ? await findUserById(user.addedByUserId) : null

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-6">
          <PatientMessagesScreen
            patientId={user.patientId}
            nurseName={nurseUser?.name ?? "your nurse"}
          />
        </main>
      </div>
    )
  }

  redirect("/signin")
}
