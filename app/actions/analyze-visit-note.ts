"use server"

import { auth } from "@/lib/auth"
import { GoogleGenAI, Type } from "@google/genai"
import type { Schema } from "@google/genai"

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

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    newRiskScore: { type: Type.NUMBER, description: "Risk score 0-100" },
    riskFactors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          factor: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["critical", "high"] },
          detail: { type: Type.STRING },
        },
        required: ["factor", "severity", "detail"],
      },
    },
    soapNote: {
      type: Type.OBJECT,
      properties: {
        subjective: { type: Type.STRING },
        objective: { type: Type.STRING },
        assessment: { type: Type.STRING },
        plan: { type: Type.STRING },
      },
      required: ["subjective", "objective", "assessment", "plan"],
    },
    voiceSummary: { type: Type.STRING },
  },
  required: ["newRiskScore", "riskFactors", "soapNote", "voiceSummary"],
}

function parseJsonSafe(raw: string): VisitAnalysis {
  let jsonStr = raw.trim()
  const codeMatch = jsonStr.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/m)
  if (codeMatch) jsonStr = codeMatch[1].trim()
  // Fix trailing commas (invalid in JSON)
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1")
  const parsed = JSON.parse(jsonStr) as VisitAnalysis
  return parsed
}

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

  const prompt = `You are summarizing a nurse's clinical visit note. CRITICAL: Use ONLY information that is explicitly stated in the clinical note below. Do not infer, assume, or add any symptoms, conditions, medications, findings, or advice that are not written in the note. If the note is short, your output must stay short and only reflect what was said.

Return a JSON object with:
- newRiskScore: number 0-100. Base this only on what the note says (e.g. "BP up" may justify a modest increase). Do not invent severity.
- riskFactors: array of items that are EXPLICITLY mentioned in the note only. Each { "factor": string, "severity": "critical" or "high", "detail": string }. If the note mentions only one thing (e.g. blood pressure), list only that. Do not add factors from your own assumptions.
- soapNote: { "subjective", "objective", "assessment", "plan" }. Restate only what is in the note in SOAP format. Keep it brief if the note is brief.
- voiceSummary: A short, warm restatement in plain English of what the nurse actually said to the patient. This will be read or played to the patient. Say only what the note says—e.g. if the note says blood pressure is up and to come back next month, the voiceSummary should say exactly that in friendly language, and must NOT mention heart condition, swelling, medications, oxygen, or any other detail not in the note.

Patient: ${patientName}. Current risk score on file: ${currentRiskScore}%.

Clinical note (use only this):
${clinicalNote}`

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        systemInstruction:
          "You summarize the nurse's clinical note only. Use exclusively what is written in the note. Do not add or assume any symptoms, conditions, medications, vitals, or advice. The voiceSummary must be a brief, friendly restatement of what the nurse said—never expand or invent.",
      },
    })
    const raw = response?.text?.trim()
    if (!raw) {
      return { ok: false, error: "Empty response from model." }
    }
    let parsed: VisitAnalysis
    try {
      parsed = parseJsonSafe(raw)
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : "Invalid JSON"
      return { ok: false, error: `Analysis response was invalid (${msg}). Please try again.` }
    }
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
