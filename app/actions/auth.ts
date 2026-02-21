"use server"

import { createNurseUser } from "@/lib/users"

export async function registerNurse(params: {
  email: string
  password: string
  name?: string
}): Promise<{ ok: boolean; error?: string }> {
  const result = await createNurseUser(params)
  return { ok: result.ok, error: result.error }
}
