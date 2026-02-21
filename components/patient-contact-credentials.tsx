"use client"

import { useState } from "react"
import { Phone, MapPin, User, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ContactInfo } from "@/lib/mongodb"
import { cn } from "@/lib/utils"

export function PatientContactInfo({ contactInfo }: { contactInfo: ContactInfo | null | undefined }) {
  if (!contactInfo || (!contactInfo.phone && !contactInfo.address && !contactInfo.emergencyContact))
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">No contact information on file yet.</p>
      </div>
    )
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
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
  )
}

export function PatientCredentials({ username }: { username: string | null | undefined }) {
  const [open, setOpen] = useState(false)
  if (!username) return null
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {open ? (
            <>
              <EyeOff className="size-4" />
              Hide credentials
            </>
          ) : (
            <>
              <Eye className="size-4" />
              Show patient login credentials
            </>
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground mb-1">Username (patient signs in with this)</p>
          <p className="font-mono text-sm font-medium">{username}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Password was set when you added this patient. Share it securely with the patient.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
