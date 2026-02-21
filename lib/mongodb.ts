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
  createdAt?: Date
  userId?: unknown
  addedByUserId?: unknown
}
