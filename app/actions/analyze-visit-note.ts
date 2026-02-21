"use server"

import { auth } from "@/lib/auth"
import { GoogleGenAI } from "@google/genai"

export type RiskFactor = { factor: string; severity: "critical" | "high"; detail: string }
export type VisitAnalysis = {
  newRiskScore: number
  riskFactors: RiskFactor[]
  soapNote: {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
  voiceSummary: string
}

const MODEL = "gemini-2.5-flash"

export async function analyzeVisitNote(
  clinicalNote: string,
  patientName: string,
  currentRiskScore: number
): Promise<{ ok: true; analysis: VisitAnalysis } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role?: string }).role !== "nurse") {
    return { ok: false, error: "Unauthorized." }
  }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { ok: false, error: "GEMINI_API_KEY is not set." }
  }

  const prompt = `You are a home health nurse assistant. Analyze this clinical visit note and return a single JSON object (no markdown, no code fence) with exactly these keys:

- newRiskScore: number 0-100 (estimate readmission/decompensation risk based on the note; consider vitals, symptoms, adherence, and acuity)
- riskFactors: array of { "factor": string, "severity": "critical" | "high", "detail": string } (3-6 items, most important first)
- soapNote: { "subjective": string, "objective": string, "assessment": string, "plan": string } (concise SOAP note)
- voiceSummary: string (2-4 sentences in plain English for the patient: what was found, what they should do, and any follow-up; warm and jargon-free)

Patient: ${patientName}. Current risk score on file: ${currentRiskScore}%.

Clinical note:
${clinicalNote}

Return only the JSON object, no other text.`

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    })
    const raw = response?.text?.trim()
    if (!raw) {
      return { ok: false, error: "Empty response from model." }
    }
    // Strip optional markdown code block
    let jsonStr = raw
    const codeMatch = raw.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/m)
    if (codeMatch) jsonStr = codeMatch[1].trim()
    const parsed = JSON.parse(jsonStr) as VisitAnalysis
    // Basic validation
    if (typeof parsed.newRiskScore !== "number") parsed.newRiskScore = Math.min(100, Math.max(0, Number(parsed.newRiskScore) || 0))
    if (!Array.isArray(parsed.riskFactors)) parsed.riskFactors = []
    if (!parsed.soapNote || typeof parsed.soapNote !== "object") {
      parsed.soapNote = { subjective: "", objective: "", assessment: "", plan: "" }
    }
    if (typeof parsed.voiceSummary !== "string") parsed.voiceSummary = String(parsed.voiceSummary ?? "")
    return { ok: true, analysis: parsed }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed"
    return { ok: false, error: message }
  }
}
