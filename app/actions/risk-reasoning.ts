"use server"

import { auth } from "@/lib/auth"
import { getDb, type VisitDoc, type PatientDoc } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { findUserById } from "@/lib/users"
import { GoogleGenAI } from "@google/genai"

const MODEL = "gemini-2.5-flash"

export async function generateRiskReasoning(
  patientId: string
): Promise<{ ok: true; reasoning: string } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." }

  const role = (session.user as { role?: string }).role
  if (role === "nurse") {
    // nurses can view any patient
  } else if (role === "patient") {
    const user = await findUserById(session.user.id)
    if (user?.patientId?.toString() !== patientId) {
      return { ok: false, error: "Unauthorized." }
    }
  } else {
    return { ok: false, error: "Unauthorized." }
  }

  if (!ObjectId.isValid(patientId)) return { ok: false, error: "Invalid patient." }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { ok: false, error: "GEMINI_API_KEY is not set." }

  const db = await getDb()

  const patient = await db
    .collection<PatientDoc>("patients")
    .findOne({ _id: new ObjectId(patientId) })
  if (!patient) return { ok: false, error: "Patient not found." }

  const visits = await db
    .collection<VisitDoc>("visits")
    .find({ patientId: new ObjectId(patientId) })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

  const visitSummaries = visits.map((v, i) => {
    const parts = [`Visit ${i + 1} (${v.date}):`]
    if (v.riskScoreBefore !== undefined && v.riskScoreAfter !== undefined) {
      parts.push(`Risk: ${v.riskScoreBefore}% → ${v.riskScoreAfter}%`)
    }
    if (v.soapNote?.assessment) parts.push(`Assessment: ${v.soapNote.assessment}`)
    if (v.riskFactors?.length) {
      parts.push(
        `Risk factors: ${v.riskFactors.map((f) => `${f.factor} (${f.severity})`).join(", ")}`
      )
    }
    if (v.clinicalNote) {
      parts.push(`Note: ${v.clinicalNote.slice(0, 300)}`)
    }
    return parts.join(" | ")
  })

  const prompt = `You are a clinical risk reasoning assistant. Given a patient's current profile and their visit history, provide a concise, plain-language explanation of WHY their current risk score is what it is.

Patient: ${patient.name}, ${patient.age} years old
Conditions: ${(patient.conditions ?? []).join(", ") || "None listed"}
Current risk score: ${patient.riskScore}%
Risk trend: ${patient.riskTrend}
Prior hospitalizations: ${patient.priorHospitalizations ?? 0}
Medications: ${(patient.medications ?? []).map((m) => m.name).join(", ") || "None listed"}

${visits.length > 0 ? `Recent visit history (most recent first):\n${visitSummaries.join("\n")}` : "No visit history recorded yet."}

Write 2-4 sentences explaining the reasoning behind the current risk score. Consider trends across visits, risk factor changes, and the patient's overall condition trajectory. Be specific and reference actual data from the visits. Use plain, warm language suitable for both clinical staff and patients. Do NOT use markdown formatting.`

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          "You are a clinical risk reasoning assistant. Provide concise, evidence-based explanations of patient risk scores. Use only the information provided. Be warm but precise.",
      },
    })

    const text = response?.text?.trim()
    if (!text) return { ok: false, error: "Empty response from AI." }

    return { ok: true, reasoning: text }
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI reasoning failed"
    return { ok: false, error: message }
  }
}
