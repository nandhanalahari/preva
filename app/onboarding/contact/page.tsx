import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export const runtime = "nodejs"
import { findUserById } from "@/lib/users"
import { ContactForm } from "@/components/contact-form"
import { Navbar } from "@/components/navbar"

export default async function OnboardingContactPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/signin")
  }
  const user = await findUserById(session.user.id)
  if (!user) redirect("/signin")
  if (user.contactInfo?.phone || user.contactInfo?.address) {
    redirect(user.role === "patient" ? "/patient-dashboard" : "/dashboard")
  }
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">Contact information</h1>
        <p className="mb-8 text-muted-foreground">
          So your {user.role === "nurse" ? "patients" : "nurse"} can reach you.
        </p>
        <ContactForm userId={user.id} role={user.role} />
      </main>
    </div>
  )
}
