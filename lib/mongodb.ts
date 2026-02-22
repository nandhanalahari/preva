import { MongoClient, Db } from "mongodb"

const uri = process.env.MONGODB_URI!

let cached: { client: MongoClient; db: Db } | null = null

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set")
  }
  if (cached?.client) {
    return cached.db
  }
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db("preva")
  cached = { client, db }
  return db
}

/** Contact info stored for nurse/patient */
export interface ContactInfo {
  phone?: string
  address?: string
  emergencyContact?: string
}

/** User document (nurses and patients with login) */
export interface UserDoc {
  _id?: unknown
  email?: string
  username?: string
  passwordHash: string
  role: "nurse" | "patient"
  name?: string
  contactInfo?: ContactInfo
  patientId?: unknown
  addedByUserId?: unknown
  createdAt?: Date
}

/** Single blood pressure reading stored on the patient */
export interface BPReading {
  date: string // YYYY-MM-DD
  systolic: number
  diastolic: number
}

/** Patient document shape in MongoDB */
export interface PatientDoc {
  _id?: unknown
  name: string
  age: number
  conditions: string[]
  medications: { name: string; dosage?: string; frequency?: string }[]
  priorHospitalizations: number
  riskScore: number
  riskTrend: "up" | "down" | "stable"
  lastVisitDate: string | null
  status: "active" | "discharged"
  imageInitials: string
  /** Blood pressure history; when empty, UI may show placeholder trend */
  bpHistory?: BPReading[]
  /** Latest visit voice summary for patient playback */
  lastVoiceSummary?: string
  /** ISO date when lastVoiceSummary was set */
  lastVoiceSummaryAt?: string
  createdAt?: Date
  userId?: unknown
  addedByUserId?: unknown
}

/** Visit record saved after each analysis */
export interface VisitDoc {
  _id?: unknown
  patientId: unknown // ObjectId
  nurseUserId: unknown // ObjectId
  date: string // YYYY-MM-DD
  clinicalNote: string
  riskScoreBefore: number
  riskScoreAfter: number
  riskFactors: { factor: string; severity: "critical" | "high"; detail: string }[]
  soapNote: { subjective: string; objective: string; assessment: string; plan: string }
  voiceSummary: string
  createdAt: Date
}

/** Appointment document for nurse scheduling */
export interface AppointmentDoc {
  _id?: unknown
  patientId: unknown // ObjectId
  addedByUserId: unknown // ObjectId (nurse)
  start: Date
  end: Date
  title?: string
  createdAt?: Date
}
