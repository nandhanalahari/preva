"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { getDb, type PatientDoc } from "@/lib/mongodb"
import { createPatientUser } from "@/lib/users"
import { ObjectId } from "mongodb"

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export type AddPatientInput = {
  name: string
  age: number
  conditions: string[]
  medications: { name: string; dosage?: string; frequency?: string }[]
  priorHospitalizations: number
  username: string
  password: string
}

export async function addPatient(input: AddPatientInput): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  const nurseUserId = session?.user?.id
  if (!nurseUserId || (session?.user as { role?: string })?.role !== "nurse") {
    return { ok: false, error: "You must be signed in as a nurse to add patients." }
  }
  if (!process.env.MONGODB_URI) {
    return {
      ok: false,
      error: "MongoDB is not configured. Set MONGODB_URI in your environment.",
    }
  }

  try {
    const db = await getDb()
    const coll = db.collection<PatientDoc>("patients")
    const doc: PatientDoc = {
      name: input.name.trim(),
      age: Number(input.age) || 0,
      conditions: input.conditions.filter(Boolean).map((c) => c.trim()),
      medications: input.medications.filter((m) => m.name?.trim()),
      priorHospitalizations: Number(input.priorHospitalizations) || 0,
      riskScore: 0,
      riskTrend: "stable",
      lastVisitDate: null,
      status: "active",
      imageInitials: getInitials(input.name.trim()),
      addedByUserId: new ObjectId(nurseUserId),
    }
    const { insertedId } = await coll.insertOne(doc as PatientDoc & { _id?: unknown })
    const patientId = insertedId.toString()

    const userResult = await createPatientUser({
      username: input.username.trim(),
      password: input.password,
      addedByUserId: nurseUserId,
      patientId,
    })
    if (!userResult.ok) {
      await coll.deleteOne({ _id: insertedId })
      return { ok: false, error: userResult.error }
    }

    await coll.updateOne(
      { _id: insertedId },
      { $set: { userId: new ObjectId(userResult.userId!) } }
    )
    revalidatePath("/dashboard")
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create patient"
    return { ok: false, error: message }
  }
}
