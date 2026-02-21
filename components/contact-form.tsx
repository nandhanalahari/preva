"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateContactInfo } from "@/app/actions/contact"
import type { ContactInfo } from "@/lib/mongodb"

export function ContactForm({ userId, role }: { userId: string; role: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const contactInfo: ContactInfo = {
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim() || undefined,
      address: (form.elements.namedItem("address") as HTMLInputElement).value.trim() || undefined,
      emergencyContact: (form.elements.namedItem("emergencyContact") as HTMLInputElement).value.trim() || undefined,
    }
    setLoading(true)
    try {
      const result = await updateContactInfo(userId, contactInfo)
      if (result.ok) {
        router.refresh()
        router.push(role === "patient" ? "/patient-dashboard" : "/dashboard")
      } else {
        setError(result.error ?? "Something went wrong.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" placeholder="Street, city, state, ZIP" rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency contact</Label>
        <Input id="emergencyContact" name="emergencyContact" type="text" placeholder="Name and phone" />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save and continue"}
      </Button>
    </form>
  )
}
