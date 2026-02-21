"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function recordBloodPressure(
  patientId: string,
  systolic: number,
  diastolic: number
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role?: string }).role !== "nurse") {
    return { ok: false, error: "You must be signed in as a nurse to record vitals." }
  }
  if (!process.env.MONGODB_URI) {
    return { ok: false, error: "MongoDB is not configured." }
  }
  if (!ObjectId.isValid(patientId)) {
    return { ok: false, error: "Invalid patient." }
  }
  const s = Number(systolic)
  const d = Number(diastolic)
  if (Number.isNaN(s) || Number.isNaN(d) || s < 1 || s > 300 || d < 1 || d > 200) {
    return { ok: false, error: "Systolic and diastolic must be valid numbers in a reasonable range." }
  }

  const date = new Date().toISOString().split("T")[0]
  try {
    const db = await getDb()
    await db.collection("patients").updateOne(
      { _id: new ObjectId(patientId) },
      { $push: { bpHistory: { date, systolic: s, diastolic: d } } }
    )
    revalidatePath("/dashboard")
    revalidatePath(`/patients/${patientId}`)
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record blood pressure"
    return { ok: false, error: message }
  }
}
