"use server"

import { updateContactInfo as updateContactInfoDb } from "@/lib/users"
import type { ContactInfo } from "@/lib/mongodb"

export async function updateContactInfo(
  userId: string,
  contactInfo: ContactInfo
): Promise<{ ok: boolean; error?: string }> {
  return updateContactInfoDb(userId, contactInfo)
}
