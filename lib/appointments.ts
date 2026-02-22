import { ObjectId } from "mongodb"
import { getDb, type AppointmentDoc } from "@/lib/mongodb"

const COLLECTION = "appointments"

export interface Appointment {
  id: string
  patientId: string
  patientName?: string
  start: Date
  end: Date
  title: string
}

function docToAppointment(
  doc: AppointmentDoc & { _id: ObjectId },
  patientName?: string
): Appointment {
  return {
    id: doc._id.toString(),
    patientId: (doc.patientId as ObjectId).toString(),
    patientName,
    start: doc.start instanceof Date ? doc.start : new Date(doc.start),
    end: doc.end instanceof Date ? doc.end : new Date(doc.end),
    title: doc.title ?? "Visit",
  }
}

/** Get appointments in a date range. For nurse: pass nurseUserId. For patient: pass patientId. */
export async function getAppointments(
  range: { start: Date; end: Date },
  options: { nurseUserId?: string; patientId?: string }
): Promise<Appointment[]> {
  if (!process.env.MONGODB_URI) return []
  const db = await getDb()
  const coll = db.collection<AppointmentDoc>(COLLECTION)
  const patientsColl = db.collection("patients")

  const filter: Record<string, unknown> = {
    start: { $lt: range.end },
    end: { $gt: range.start },
  }
  if (options.nurseUserId) {
    filter.addedByUserId = new ObjectId(options.nurseUserId)
  }
  if (options.patientId) {
    filter.patientId = new ObjectId(options.patientId)
  }

  const docs = await coll.find(filter).sort({ start: 1 }).toArray()
  if (docs.length === 0) return []

  const patientIds = [...new Set(docs.map((d) => (d.patientId as ObjectId).toString()))]
  const patientDocs = await patientsColl
    .find({ _id: { $in: patientIds.map((id) => new ObjectId(id)) } })
    .project({ _id: 1, name: 1 })
    .toArray()
  const nameMap = new Map(patientDocs.map((p) => [p._id.toString(), p.name as string]))

  return docs.map((d) => docToAppointment(d as AppointmentDoc & { _id: ObjectId }, nameMap.get((d.patientId as ObjectId).toString())))
}

export async function createAppointment(
  nurseUserId: string,
  patientId: string,
  start: Date | string,
  end: Date | string,
  title?: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const db = await getDb()
  const coll = db.collection<AppointmentDoc>(COLLECTION)
  const startDate = start instanceof Date ? start : new Date(start)
  const endDate = end instanceof Date ? end : new Date(end)
  const doc: AppointmentDoc = {
    patientId: new ObjectId(patientId),
    addedByUserId: new ObjectId(nurseUserId),
    start: startDate,
    end: endDate,
    title: title?.trim() || "Visit",
  }
  const { insertedId } = await coll.insertOne(doc as AppointmentDoc & { _id?: ObjectId })
  return { ok: true, id: insertedId.toString() }
}

export async function updateAppointment(
  appointmentId: string,
  start: Date | string,
  end: Date | string
): Promise<{ ok: boolean; error?: string }> {
  const startDate = start instanceof Date ? start : new Date(start)
  const endDate = end instanceof Date ? end : new Date(end)
  const db = await getDb()
  const result = await db.collection<AppointmentDoc>(COLLECTION).updateOne(
    { _id: new ObjectId(appointmentId) },
    { $set: { start: startDate, end: endDate } }
  )
  if (result.matchedCount === 0) return { ok: false, error: "Appointment not found." }
  return { ok: true }
}

export async function deleteAppointment(appointmentId: string): Promise<{ ok: boolean; error?: string }> {
  const db = await getDb()
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(appointmentId) })
  if (result.deletedCount === 0) return { ok: false, error: "Appointment not found." }
  return { ok: true }
}
