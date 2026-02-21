"use server"

import { auth } from "@/lib/auth"
import { findUserById } from "@/lib/users"
import { getPatientDetail } from "@/lib/patients"
import { GoogleGenAI } from "@google/genai"

const MODEL = "gemini-2.5-flash"

export async function generateDailySummary(
  patientId: string
): Promise<{ ok: true; summary: string } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." }
  const role = (session.user as { role?: string }).role
  if (role === "nurse") {
    // nurse can generate for any patient
  } else if (role === "patient") {
    const user = await findUserById(session.user.id)
    if (user?.patientId?.toString() !== patientId) return { ok: false, error: "You can only generate your own summary." }
  } else {
    return { ok: false, error: "Unauthorized." }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { ok: false, error: "GEMINI_API_KEY is not set." }

  const detail = await getPatientDetail(patientId)
  if (!detail) return { ok: false, error: "Patient not found." }

  const { patient, medications } = detail
  const medList = medications.length
    ? medications.map((m) => `${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` — ${m.frequency}` : ""}`).join("\n")
    : "None listed"
  const conditionsList = patient.conditions?.length ? patient.conditions.join(", ") : "None listed"

  const prompt = `You are a caring health assistant. Given this patient's information, write a short "What you need to do today" summary in plain language (4–6 bullet points). Be warm and clear. Include:
- Medications to take today (with dosage/timing if known)
- Current risk level (${patient.riskScore}%) and what it means in one simple line
- Their conditions (${conditionsList}) and any daily self-care that applies
- One practical reminder (e.g. weigh yourself, limit salt, when to call the nurse)

Patient: ${patient.name}, age ${patient.age}.
Risk score: ${patient.riskScore}%.
Conditions: ${conditionsList}
Medications:
${medList}

Return only the bullet list, no heading. Use a dash or bullet for each point. Keep each point 1–2 sentences.`

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    })
    const text = response?.text?.trim()
    if (!text) return { ok: false, error: "Could not generate summary." }
    return { ok: true, summary: text }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summary failed"
    return { ok: false, error: message }
  }
}
