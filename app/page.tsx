import { auth } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"

export default async function HomePage() {
  const session = await auth()
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? null
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Navbar />
      <HeroSection userRole={userRole === "nurse" ? "nurse" : userRole === "patient" ? "patient" : null} />
    </div>
  )
}
