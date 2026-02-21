"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addPatient } from "@/app/actions/patients"
import { cn } from "@/lib/utils"

export function AddPatientButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    try {
      const name = (formData.get("name") as string)?.trim()
      const age = Number(formData.get("age"))
      const conditionsText = (formData.get("conditions") as string)?.trim() || ""
      const medicationsText = (formData.get("medications") as string)?.trim() || ""
      const priorHospitalizations = Number(formData.get("priorHospitalizations")) || 0
      const username = (formData.get("username") as string)?.trim()
      const password = formData.get("password") as string

      const conditions = conditionsText
        .split(/[\n,]+/)
        .map((c) => c.trim())
        .filter(Boolean)

      const medicationLines = medicationsText
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      const medications = medicationLines.map((line) => {
        const parts = line.split(/\s{2,}|\t/).filter(Boolean)
        if (parts.length >= 3) {
          return { name: parts[0], dosage: parts[1], frequency: parts.slice(2).join(" ") }
        }
        if (parts.length === 2) {
          return { name: parts[0], dosage: parts[1] }
        }
        return { name: line }
      })

      if (!username || !password || password.length < 6) {
        setError("Username and password (min 6 characters) are required.")
        setLoading(false)
        return
      }
      const result = await addPatient({
        name,
        age: isNaN(age) ? 0 : age,
        conditions,
        medications,
        priorHospitalizations,
        username,
        password,
      })

      if (result.ok) {
        setOpen(false)
      } else {
        setError(result.error ?? "Something went wrong.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("gap-2", className)} size="default">
          <UserPlus className="size-4" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Patient</DialogTitle>
          <DialogDescription>
            Create a new patient record. Fill in the basics — the rest can be updated during visits.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(new FormData(e.currentTarget as HTMLFormElement))
          }}
        >
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" placeholder="e.g. Mary Thompson" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              min={1}
              max={120}
              placeholder="e.g. 74"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="conditions">Conditions (one per line or comma-separated)</Label>
            <Textarea
              id="conditions"
              name="conditions"
              placeholder="CHF&#10;Hypertension&#10;Type 2 Diabetes"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="medications">Medications (one per line: name, dosage, frequency)</Label>
            <Textarea
              id="medications"
              name="medications"
              placeholder="Lisinopril  20mg  Once daily&#10;Metformin  500mg  Twice daily"
              rows={4}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priorHospitalizations">Prior hospitalizations</Label>
            <Input
              id="priorHospitalizations"
              name="priorHospitalizations"
              type="number"
              min={0}
              placeholder="0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Login username (unique, no email)</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="e.g. mary.thompson"
              required
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Login password (min 6 characters)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
