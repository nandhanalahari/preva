import { ObjectId } from "mongodb"
import { getDb, type PatientDoc, type VisitDoc } from "@/lib/mongodb"
import { getPatientsSortedByRisk, getPatientDetail as getMockPatientDetail } from "@/lib/data"
import type { Patient, PatientDetail, Medication, RiskHistoryPoint, BPHistoryPoint, Visit } from "@/lib/data"

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split("T")[0]
}

/** Placeholder risk history (e.g. when no visit data yet) so the chart isn't empty. Deterministic. */
function placeholderRiskHistory(riskScore: number, count = 30): RiskHistoryPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    const variation = Math.round((Math.sin(i * 0.7) + Math.cos(i * 0.3)) * 3)
    return {
      date: daysAgo(count - 1 - i),
      score: Math.max(0, Math.min(100, riskScore + variation)),
    }
  })
}

/** Placeholder BP history so the chart isn't empty. Deterministic. */
function placeholderBPHistory(count = 30): BPHistoryPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const variationS = Math.round((Math.sin(i * 0.5) * 6))
    const variationD = Math.round((Math.cos(i * 0.4) * 4))
    return {
      date: daysAgo(count - 1 - i),
      systolic: 122 + variationS,
      diastolic: 78 + variationD,
    }
  })
}

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
        const riskHistory = placeholderRiskHistory(patient.riskScore)
        const bpHistory =
          doc.bpHistory && doc.bpHistory.length > 0
            ? doc.bpHistory.map((b) => ({
                date: b.date,
                systolic: b.systolic,
                diastolic: b.diastolic,
              }))
            : placeholderBPHistory()
        const visitDocs = await db
          .collection<VisitDoc>("visits")
          .find({ patientId: new ObjectId(id) })
          .sort({ createdAt: -1 })
          .limit(50)
          .toArray()

        const visits: Visit[] = visitDocs.map((v) => ({
          id: (v._id as ObjectId).toString(),
          patientId: (v.patientId as ObjectId).toString(),
          date: v.date,
          nurseNote: v.clinicalNote ?? "",
          vitalsBP: "",
          symptoms: [],
          riskScoreBefore: v.riskScoreBefore,
          riskScoreAfter: v.riskScoreAfter,
          soapNote: v.soapNote,
          riskFactors: v.riskFactors,
          voiceSummary: v.voiceSummary,
        }))

        return {
          patient,
          riskHistory,
          bpHistory,
          medications,
          visits,
          lastVoiceSummary: doc.lastVoiceSummary ?? null,
          lastVoiceSummaryAt: doc.lastVoiceSummaryAt ?? null,
        }
      }
    } catch {
      // fall through to mock
    }
  }

  return getMockPatientDetail(id)
}
