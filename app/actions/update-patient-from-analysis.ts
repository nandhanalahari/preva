"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { getDb, type VisitDoc } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { VisitAnalysis } from "@/app/actions/analyze-visit-note"

export async function updatePatientFromAnalysis(
  patientId: string,
  analysis: VisitAnalysis,
  clinicalNote?: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role?: string }).role !== "nurse") {
    return { ok: false, error: "Unauthorized." }
  }
  if (!process.env.MONGODB_URI) {
    return { ok: false, error: "MongoDB is not configured." }
  }
  if (!ObjectId.isValid(patientId)) {
    return { ok: false, error: "Invalid patient." }
  }

  const today = new Date().toISOString().split("T")[0]
  try {
    const db = await getDb()
    const patientsColl = db.collection("patients")
    const doc = await patientsColl.findOne({ _id: new ObjectId(patientId) })
    if (!doc) return { ok: false, error: "Patient not found." }

    const currentScore = Number(doc.riskScore) ?? 0
    const newScore = Math.min(100, Math.max(0, Number(analysis.newRiskScore) ?? 0))
    const riskTrend =
      newScore > currentScore ? "up" : newScore < currentScore ? "down" : "stable"

    await patientsColl.updateOne(
      { _id: new ObjectId(patientId) },
      {
        $set: {
          riskScore: newScore,
          riskTrend,
          lastVisitDate: today,
          lastVoiceSummary: analysis.voiceSummary?.trim() ?? "",
          lastVoiceSummaryAt: today,
        },
      }
    )

    const visitDoc: VisitDoc = {
      patientId: new ObjectId(patientId),
      nurseUserId: new ObjectId(session.user.id),
      date: today,
      clinicalNote: clinicalNote?.trim() ?? "",
      riskScoreBefore: currentScore,
      riskScoreAfter: newScore,
      riskFactors: analysis.riskFactors ?? [],
      soapNote: analysis.soapNote ?? { subjective: "", objective: "", assessment: "", plan: "" },
      voiceSummary: analysis.voiceSummary?.trim() ?? "",
      createdAt: new Date(),
    }
    await db.collection("visits").insertOne(visitDoc)

    revalidatePath("/dashboard")
    revalidatePath(`/patients/${patientId}`)
    revalidatePath("/patient-dashboard")
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed"
    return { ok: false, error: message }
  }
}
