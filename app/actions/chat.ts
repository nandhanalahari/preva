"use server"

import { auth } from "@/lib/auth"
import { getDb, type ChatMessageDoc } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { findUserById } from "@/lib/users"

type ChatMsg = {
  id: string
  senderId: string
  senderRole: "nurse" | "patient"
  text: string
  read: boolean
  createdAt: string
}

async function resolvePatientId(userId: string, role: string, patientId?: string): Promise<string | null> {
  if (role === "nurse") {
    if (!patientId || !ObjectId.isValid(patientId)) return null
    const db = await getDb()
    const patient = await db.collection("patients").findOne({
      _id: new ObjectId(patientId),
      addedByUserId: new ObjectId(userId),
    })
    return patient ? patientId : null
  }
  if (role === "patient") {
    const user = await findUserById(userId)
    return user?.patientId?.toString() ?? null
  }
  return null
}

export async function sendChatMessage(
  patientId: string,
  text: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." }
  const role = (session.user as { role?: string }).role ?? ""

  const resolvedPid = await resolvePatientId(session.user.id, role, patientId)
  if (!resolvedPid) return { ok: false, error: "Invalid patient." }

  const trimmed = text.trim()
  if (!trimmed) return { ok: false, error: "Empty message." }

  const db = await getDb()
  await db.collection("chatMessages").insertOne({
    patientId: new ObjectId(resolvedPid),
    senderId: new ObjectId(session.user.id),
    senderRole: role as "nurse" | "patient",
    text: trimmed,
    read: false,
    createdAt: new Date(),
  } as any)

  return { ok: true }
}

export async function fetchChatMessages(
  patientId: string,
  afterIso?: string
): Promise<ChatMsg[]> {
  const session = await auth()
  if (!session?.user?.id) return []
  const role = (session.user as { role?: string }).role ?? ""

  const resolvedPid = await resolvePatientId(session.user.id, role, patientId)
  if (!resolvedPid) return []

  const db = await getDb()
  const filter: Record<string, unknown> = { patientId: new ObjectId(resolvedPid) }
  if (afterIso) {
    filter.createdAt = { $gt: new Date(afterIso) }
  }

  const docs = await db
    .collection<ChatMessageDoc>("chatMessages")
    .find(filter)
    .sort({ createdAt: 1 })
    .limit(200)
    .toArray()

  return docs.map((d) => ({
    id: (d._id as ObjectId).toString(),
    senderId: (d.senderId as ObjectId).toString(),
    senderRole: d.senderRole,
    text: d.text,
    read: d.read,
    createdAt: (d.createdAt ?? new Date()).toISOString(),
  }))
}

export async function getUnreadCounts(
  patientIds: string[]
): Promise<Record<string, number>> {
  const session = await auth()
  if (!session?.user?.id) return {}
  const role = (session.user as { role?: string }).role ?? ""
  if (role !== "nurse") return {}

  const validIds = patientIds.filter((id) => ObjectId.isValid(id))
  if (validIds.length === 0) return {}

  const db = await getDb()
  const pipeline = [
    {
      $match: {
        patientId: { $in: validIds.map((id) => new ObjectId(id)) },
        senderRole: "patient",
        read: false,
      },
    },
    { $group: { _id: "$patientId", count: { $sum: 1 } } },
  ]
  const results = await db.collection("chatMessages").aggregate(pipeline).toArray()
  const counts: Record<string, number> = {}
  for (const r of results) {
    counts[(r._id as ObjectId).toString()] = r.count as number
  }
  return counts
}

export async function markChatRead(patientId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return
  const role = (session.user as { role?: string }).role ?? ""

  const resolvedPid = await resolvePatientId(session.user.id, role, patientId)
  if (!resolvedPid) return

  const otherRole = role === "nurse" ? "patient" : "nurse"
  const db = await getDb()
  await db.collection("chatMessages").updateMany(
    {
      patientId: new ObjectId(resolvedPid),
      senderRole: otherRole,
      read: false,
    },
    { $set: { read: true } }
  )
}
