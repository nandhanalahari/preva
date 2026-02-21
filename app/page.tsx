import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Navbar />
      <HeroSection />
    </div>
  )
}
