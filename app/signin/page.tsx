import { Navbar } from "@/components/navbar"
import { SignInForm } from "@/components/signin-form"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-center text-2xl font-semibold text-foreground">
          Sign In
        </h1>
        <SignInForm />
      </main>
    </div>
  )
}
