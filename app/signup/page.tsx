import { Navbar } from "@/components/navbar"
import { SignUpForm } from "@/components/signup-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-center text-2xl font-semibold text-foreground">
          Sign Up
        </h1>
        <SignUpForm />
      </main>
    </div>
  )
}
