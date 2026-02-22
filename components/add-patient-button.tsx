"use client"

import { useState } from "react"
import { UserPlus, Plus, Trash2 } from "lucide-react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { addPatient } from "@/app/actions/patients"
import { cn } from "@/lib/utils"

type MedicationRow = { name: string; dosage: string; frequency: string }

const defaultMedicationRow = (): MedicationRow => ({ name: "", dosage: "", frequency: "" })

export function AddPatientButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [medications, setMedications] = useState<MedicationRow[]>([defaultMedicationRow()])

  function addMedicationRow() {
    setMedications((prev) => [...prev, defaultMedicationRow()])
  }

  function removeMedicationRow(index: number) {
    setMedications((prev) => prev.filter((_, i) => i !== index))
  }

  function updateMedicationRow(index: number, field: keyof MedicationRow, value: string) {
    setMedications((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    try {
      const name = (formData.get("name") as string)?.trim()
      const age = Number(formData.get("age"))
      const conditionsText = (formData.get("conditions") as string)?.trim() || ""
      const priorHospitalizations = Number(formData.get("priorHospitalizations")) || 0
      const username = (formData.get("username") as string)?.trim()
      const password = formData.get("password") as string

      const conditions = conditionsText
        .split(/[\n,]+/)
        .map((c) => c.trim())
        .filter(Boolean)

      const medicationsPayload = medications
        .map((m) => ({
          name: m.name.trim(),
          dosage: m.dosage.trim(),
          frequency: m.frequency.trim(),
        }))
        .filter((m) => m.name)

      if (!username || !password || password.length < 6) {
        setError("Username and password (min 6 characters) are required.")
        setLoading(false)
        return
      }
      const result = await addPatient({
        name,
        age: isNaN(age) ? 0 : age,
        conditions,
        medications: medicationsPayload,
        priorHospitalizations,
        username,
        password,
      })

      if (result.ok) {
        setMedications([defaultMedicationRow()])
        setOpen(false)
      } else {
        setError(result.error ?? "Something went wrong.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setMedications([defaultMedicationRow()])
      }}
    >
      <DialogTrigger asChild>
        <Button className={cn("gap-2", className)} size="default">
          <UserPlus className="size-4" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Patient</DialogTitle>
          <DialogDescription>
            Create a new patient record. Fill in the basics — the rest can be updated during visits.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-col"
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(new FormData(e.currentTarget as HTMLFormElement))
          }}
        >
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="flex flex-col gap-4 pb-2">
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
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Medications</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMedicationRow}
                    className="h-7 gap-1 text-xs"
                  >
                    <Plus className="size-3.5" />
                    Add row
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Medication</TableHead>
                        <TableHead className="w-[25%]">Dosage</TableHead>
                        <TableHead className="w-[25%]">Frequency</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medications.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="p-1.5">
                            <Input
                              placeholder="e.g. Lisinopril"
                              value={row.name}
                              onChange={(e) => updateMedicationRow(index, "name", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </TableCell>
                          <TableCell className="p-1.5">
                            <Input
                              placeholder="e.g. 20mg"
                              value={row.dosage}
                              onChange={(e) => updateMedicationRow(index, "dosage", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </TableCell>
                          <TableCell className="p-1.5">
                            <Input
                              placeholder="e.g. Once daily"
                              value={row.frequency}
                              onChange={(e) => updateMedicationRow(index, "frequency", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </TableCell>
                          <TableCell className="p-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeMedicationRow(index)}
                              disabled={medications.length <= 1}
                              aria-label="Remove row"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
            </div>
          </div>
          <DialogFooter className="pt-3">
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
