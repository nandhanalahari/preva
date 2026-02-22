"use server"

import { auth } from "@/lib/auth"
import { updateContactInfo as updateContactInfoDb } from "@/lib/users"
import type { ContactInfo } from "@/lib/mongodb"
import { revalidatePath } from "next/cache"

export async function updateContactInfo(
  userId: string,
  contactInfo: ContactInfo
): Promise<{ ok: boolean; error?: string }> {
  return updateContactInfoDb(userId, contactInfo)
}

export async function updateMyContactInfo(
  contactInfo: ContactInfo
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." }
  const result = await updateContactInfoDb(session.user.id, contactInfo)
  if (result.ok) {
    const role = (session.user as { role?: string }).role
    revalidatePath(role === "patient" ? "/patient-dashboard" : "/dashboard")
  }
  return result
}
