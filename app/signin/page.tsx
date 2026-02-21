import { Navbar } from "@/components/navbar"
import { SignInForm } from "@/components/signin-form"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await searchParams
  const defaultRole = role === "patient" ? "patient" : "nurse"
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-center text-2xl font-semibold text-foreground">
          Sign In
        </h1>
        <SignInForm defaultRole={defaultRole} />
      </main>
    </div>
  )
}
