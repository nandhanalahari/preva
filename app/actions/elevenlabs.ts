"use server"

import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { findUserById } from "@/lib/users"

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1"
/** Default voice ID (from ElevenLabs docs example) */
const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"
const TTS_MODEL = "eleven_multilingual_v2"
const STT_MODEL = "scribe_v2"

function getApiKey(): string | null {
  return process.env.ELEVENLABS_API_KEY ?? null
}

/** Returns base64-encoded MP3 audio for the given text. Nurse can call anytime; patient only when forPatientId is their own (e.g. daily summary). */
export async function synthesizeSpeech(
  text: string,
  options?: { forPatientId?: string }
): Promise<{ ok: true; audioBase64: string } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." }
  const role = (session.user as { role?: string }).role
  if (role === "nurse") {
    // ok
  } else if (role === "patient" && options?.forPatientId) {
    const user = await findUserById(session.user.id)
    if (user?.patientId?.toString() !== options.forPatientId) return { ok: false, error: "Unauthorized." }
  } else {
    return { ok: false, error: "Unauthorized." }
  }
  const apiKey = getApiKey()
  if (!apiKey) return { ok: false, error: "ELEVENLABS_API_KEY is not set." }
  if (!text?.trim()) return { ok: false, error: "No text to speak." }

  try {
    const url = `${ELEVENLABS_BASE}/text-to-speech/${DEFAULT_VOICE_ID}?output_format=mp3_44100_128`
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({ text: text.trim(), model_id: TTS_MODEL }),
    })
    if (!res.ok) {
      const errText = await res.text()
      return { ok: false, error: `ElevenLabs TTS: ${res.status} ${errText.slice(0, 200)}` }
    }
    const buf = await res.arrayBuffer()
    const base64 = Buffer.from(buf).toString("base64")
    return { ok: true, audioBase64: base64 }
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS failed"
    return { ok: false, error: message }
  }
}

/** Accepts FormData with a single file field "file" (audio). Returns transcript text. */
export async function transcribeAudio(
  formData: FormData
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role?: string }).role !== "nurse") {
    return { ok: false, error: "Unauthorized." }
  }
  const apiKey = getApiKey()
  if (!apiKey) return { ok: false, error: "ELEVENLABS_API_KEY is not set." }

  const file = formData.get("file")
  if (!file || !(file instanceof Blob)) {
    return { ok: false, error: "No audio file provided." }
  }

  try {
    const body = new FormData()
    body.append("file", file)
    body.append("model_id", STT_MODEL)

    const res = await fetch(`${ELEVENLABS_BASE}/speech-to-text`, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body,
    })
    if (!res.ok) {
      const errText = await res.text()
      return { ok: false, error: `ElevenLabs STT: ${res.status} ${errText.slice(0, 200)}` }
    }
    const data = (await res.json()) as { text?: string }
    const text = typeof data?.text === "string" ? data.text.trim() : ""
    return { ok: true, text: text || "(no speech detected)" }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed"
    return { ok: false, error: message }
  }
}

/** Returns TTS audio for the given patient's latest visit summary. Allowed for that patient or a nurse. */
export async function synthesizePatientSummary(
  patientId: string
): Promise<{ ok: true; audioBase64: string } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." }
  const role = (session.user as { role?: string }).role
  if (role === "nurse") {
    // nurse can play any patient's summary
  } else if (role === "patient") {
    const user = await findUserById(session.user.id)
    const userPatientId = user?.patientId?.toString()
    if (userPatientId !== patientId) return { ok: false, error: "You can only play your own summary." }
  } else {
    return { ok: false, error: "Unauthorized." }
  }
  if (!ObjectId.isValid(patientId)) return { ok: false, error: "Invalid patient." }
  const apiKey = getApiKey()
  if (!apiKey) return { ok: false, error: "ELEVENLABS_API_KEY is not set." }

  const db = await getDb()
  const doc = await db.collection("patients").findOne(
    { _id: new ObjectId(patientId) },
    { projection: { lastVoiceSummary: 1 } }
  )
  const text = doc?.lastVoiceSummary?.trim()
  if (!text) return { ok: false, error: "No visit summary available yet. Your nurse will add one after a visit." }

  try {
    const url = `${ELEVENLABS_BASE}/text-to-speech/${DEFAULT_VOICE_ID}?output_format=mp3_44100_128`
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({ text, model_id: TTS_MODEL }),
    })
    if (!res.ok) {
      const errText = await res.text()
      return { ok: false, error: `TTS failed: ${res.status}` }
    }
    const buf = await res.arrayBuffer()
    const base64 = Buffer.from(buf).toString("base64")
    return { ok: true, audioBase64: base64 }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Playback failed"
    return { ok: false, error: message }
  }
}
