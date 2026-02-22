"use server"

import { auth } from "@/lib/auth"
import { getDb, PatientMessageDoc } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { findUserById } from "@/lib/users"
import { GoogleGenAI, Type } from "@google/genai"
import type { Schema } from "@google/genai"
import { revalidatePath } from "next/cache"

const MODEL = "gemini-2.5-flash"

const PATIENT_ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    symptoms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of symptoms mentioned by the patient",
    },
    summary: {
      type: Type.STRING,
      description: "Brief clinical summary of the patient's self-reported condition",
    },
  },
  required: ["symptoms", "summary"],
}

async function getPatientId(userId: string): Promise<string | null> {
  const user = await findUserById(userId)
  return user?.patientId?.toString() ?? null
}

export async function submitPatientMessage(
  transcript: string,
  mode: "raw" | "analyzed"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." }
  if ((session.user as { role?: string }).role !== "patient") {
    return { ok: false, error: "Only patients can submit messages." }
  }

  const patientId = await getPatientId(session.user.id)
  if (!patientId) return { ok: false, error: "No patient record linked." }

  const text = transcript.trim()
  if (!text) return { ok: false, error: "No text provided." }

  const doc: PatientMessageDoc = {
    patientId: new ObjectId(patientId),
    type: mode,
    transcript: text,
    read: false,
    createdAt: new Date(),
  }

  if (mode === "analyzed") {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return { ok: false, error: "GEMINI_API_KEY is not set." }

    try {
      const ai = new GoogleGenAI({ apiKey })
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `A patient recorded the following voice message about their condition. Extract the symptoms they mention and provide a brief clinical summary. Use ONLY information stated in the message.

Patient message:
${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: PATIENT_ANALYSIS_SCHEMA,
          systemInstruction:
            "Extract symptoms and summarize the patient's self-reported condition. Use only what the patient says. Do not infer or add anything.",
        },
      })

      const raw = response?.text?.trim()
      if (raw) {
        let jsonStr = raw
        const codeMatch = jsonStr.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/m)
        if (codeMatch) jsonStr = codeMatch[1].trim()
        jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1")
        const parsed = JSON.parse(jsonStr) as { symptoms: string[]; summary: string }
        doc.symptoms = Array.isArray(parsed.symptoms) ? parsed.symptoms : []
        doc.aiSummary = typeof parsed.summary === "string" ? parsed.summary : ""
      }
    } catch {
      doc.symptoms = []
      doc.aiSummary = "(AI analysis unavailable)"
    }
  }

  const db = await getDb()
  await db.collection("patientMessages").insertOne(doc as any)

  revalidatePath("/patients/[id]", "page")
  return { ok: true }
}

export async function fetchPatientMessages(
  patientId: string
): Promise<
  {
    id: string
    type: "raw" | "analyzed"
    transcript: string
    symptoms?: string[]
    aiSummary?: string
    nurseReply?: string
    nurseReplyAt?: string
    read: boolean
    createdAt: string
  }[]
> {
  const session = await auth()
  if (!session?.user?.id) return []
  const role = (session.user as { role?: string }).role

  if (role === "nurse") {
    // ok
  } else if (role === "patient") {
    const pid = await getPatientId(session.user.id)
    if (pid !== patientId) return []
  } else {
    return []
  }

  if (!ObjectId.isValid(patientId)) return []

  const db = await getDb()
  const docs = await db
    .collection<PatientMessageDoc>("patientMessages")
    .find({ patientId: new ObjectId(patientId) })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()

  return docs.map((d) => ({
    id: (d._id as ObjectId).toString(),
    type: d.type,
    transcript: d.transcript,
    symptoms: d.symptoms,
    aiSummary: d.aiSummary,
    nurseReply: d.nurseReply,
    nurseReplyAt: d.nurseReplyAt ? d.nurseReplyAt.toISOString() : undefined,
    read: d.read,
    createdAt: (d.createdAt ?? new Date()).toISOString(),
  }))
}

export async function replyToPatientMessage(
  messageId: string,
  reply: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." }
  if ((session.user as { role?: string }).role !== "nurse") {
    return { ok: false, error: "Only nurses can reply." }
  }
  const text = reply.trim()
  if (!text) return { ok: false, error: "Reply cannot be empty." }
  if (!ObjectId.isValid(messageId)) return { ok: false, error: "Invalid message." }

  const db = await getDb()
  const result = await db.collection("patientMessages").updateOne(
    { _id: new ObjectId(messageId) },
    { $set: { nurseReply: text, nurseReplyAt: new Date() } }
  )
  if (result.matchedCount === 0) return { ok: false, error: "Message not found." }

  revalidatePath("/patients/[id]", "page")
  revalidatePath("/patient-dashboard", "page")
  return { ok: true }
}

export async function markMessagesRead(
  patientId: string
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return
  if ((session.user as { role?: string }).role !== "nurse") return
  if (!ObjectId.isValid(patientId)) return

  const db = await getDb()
  await db
    .collection("patientMessages")
    .updateMany(
      { patientId: new ObjectId(patientId), read: false },
      { $set: { read: true } }
    )
}
