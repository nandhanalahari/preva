"use client"

import { useState, useCallback } from "react"
import { Phone, MapPin, User, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { updateMyContactInfo } from "@/app/actions/contact"
import type { ContactInfo } from "@/lib/mongodb"

export function EditableContactInfo({
  initialContactInfo,
  title = "Your contact information",
  description,
}: {
  initialContactInfo?: ContactInfo | null
  title?: string
  description?: string
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [contactInfo, setContactInfo] = useState<ContactInfo>(
    initialContactInfo ?? {}
  )

  const [formPhone, setFormPhone] = useState(contactInfo.phone ?? "")
  const [formAddress, setFormAddress] = useState(contactInfo.address ?? "")
  const [formEmergency, setFormEmergency] = useState(
    contactInfo.emergencyContact ?? ""
  )

  const startEditing = useCallback(() => {
    setFormPhone(contactInfo.phone ?? "")
    setFormAddress(contactInfo.address ?? "")
    setFormEmergency(contactInfo.emergencyContact ?? "")
    setError(null)
    setSaved(false)
    setEditing(true)
  }, [contactInfo])

  const cancelEditing = useCallback(() => {
    setEditing(false)
    setError(null)
  }, [])

  const handleSave = useCallback(async () => {
    setError(null)
    setSaving(true)
    const newInfo: ContactInfo = {
      phone: formPhone.trim() || undefined,
      address: formAddress.trim() || undefined,
      emergencyContact: formEmergency.trim() || undefined,
    }
    try {
      const result = await updateMyContactInfo(newInfo)
      if (result.ok) {
        setContactInfo(newInfo)
        setEditing(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        setError(result.error ?? "Failed to save.")
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setSaving(false)
    }
  }, [formPhone, formAddress, formEmergency])

  const hasAnyInfo =
    contactInfo.phone || contactInfo.address || contactInfo.emergencyContact

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Phone className="size-5 text-primary" />
              {title}
            </CardTitle>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {!editing && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={startEditing}
            >
              <Pencil className="size-3.5" />
              {hasAnyInfo ? "Edit" : "Add"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {saved && (
          <p className="mb-3 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" />
            Contact info saved.
          </p>
        )}

        {editing ? (
          <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone" className="text-xs">
                Phone
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-address" className="text-xs">
                Address
              </Label>
              <Input
                id="edit-address"
                placeholder="Street, city, state, ZIP"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-emergency" className="text-xs">
                Emergency contact
              </Label>
              <Input
                id="edit-emergency"
                placeholder="Name and phone"
                value={formEmergency}
                onChange={(e) => setFormEmergency(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                className="gap-1.5"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Check className="size-3.5" />
                )}
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                disabled={saving}
                onClick={cancelEditing}
              >
                <X className="size-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        ) : hasAnyInfo ? (
          <div className="space-y-2">
            {contactInfo.phone && (
              <p className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                {contactInfo.phone}
              </p>
            )}
            {contactInfo.address && (
              <p className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                {contactInfo.address}
              </p>
            )}
            {contactInfo.emergencyContact && (
              <p className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground" />
                Emergency: {contactInfo.emergencyContact}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No contact information added yet. Tap "Add" to get started.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
