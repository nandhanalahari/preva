import { ObjectId } from "mongodb"
import { getDb, type PatientDoc } from "@/lib/mongodb"
import { getPatientsSortedByRisk, getPatientDetail as getMockPatientDetail } from "@/lib/data"
import type { Patient, PatientDetail, Medication } from "@/lib/data"

const COLLECTION = "patients"

function docToPatient(doc: PatientDoc & { _id: ObjectId }): Patient {
  return {
    id: doc._id.toString(),
    name: doc.name,
    age: doc.age,
    conditions: doc.conditions ?? [],
    priorHospitalizations: doc.priorHospitalizations ?? 0,
    riskScore: doc.riskScore ?? 0,
    riskTrend: doc.riskTrend ?? "stable",
    lastVisitDate: doc.lastVisitDate ?? "",
    status: doc.status ?? "active",
    imageInitials: doc.imageInitials ?? getInitials(doc.name),
  }
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Fetches patients for the dashboard. When nurseUserId is set, only returns patients added by that nurse.
 */
export async function getDashboardPatients(nurseUserId?: string): Promise<{
  patients: Patient[]
  fromMongo: boolean
}> {
  if (!process.env.MONGODB_URI) {
    return { patients: getPatientsSortedByRisk(), fromMongo: false }
  }

  try {
    const db = await getDb()
    const coll = db.collection<PatientDoc>(COLLECTION)
    const filter = nurseUserId ? { addedByUserId: new ObjectId(nurseUserId) } : {}
    const cursor = coll.find(filter).sort({ riskScore: -1 })
    const docs = await cursor.toArray()
    if (docs.length === 0 && !nurseUserId) {
      return { patients: getPatientsSortedByRisk(), fromMongo: false }
    }
    const patients = docs.map((d) => docToPatient(d as PatientDoc & { _id: ObjectId }))
    return { patients, fromMongo: true }
  } catch {
    return { patients: getPatientsSortedByRisk(), fromMongo: false }
  }
}

/**
 * Fetches a single patient detail by id. Tries MongoDB first (by ObjectId or string id), then mock data (for slug ids).
 */
export async function getPatientDetail(id: string): Promise<PatientDetail | undefined> {
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb()
      const coll = db.collection<PatientDoc>(COLLECTION)
      if (!ObjectId.isValid(id)) return getMockPatientDetail(id)
      const doc = await coll.findOne({ _id: new ObjectId(id) })
      if (doc && doc._id) {
        const patient = docToPatient(doc as PatientDoc & { _id: ObjectId })
        const medications: Medication[] = (doc.medications ?? []).map((m) => ({
          name: m.name ?? "",
          dosage: m.dosage ?? "",
          frequency: m.frequency ?? "",
          adherencePercent: 0,
          lastTaken: "",
        }))
        return {
          patient,
          riskHistory: [],
          bpHistory: [],
          medications,
          visits: [],
        }
      }
    } catch {
      // fall through to mock
    }
  }

  return getMockPatientDetail(id)
}
