import { ObjectId } from "mongodb"
import { getDb, type UserDoc, type ContactInfo } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

const COLLECTION = "users"
const SALT_ROUNDS = 10

export type UserRole = "nurse" | "patient"

export interface SafeUser {
  id: string
  email?: string
  username?: string
  role: UserRole
  name?: string
  contactInfo?: ContactInfo
  patientId?: string
  addedByUserId?: string
}

function docToSafeUser(doc: UserDoc & { _id: ObjectId }): SafeUser {
  return {
    id: doc._id.toString(),
    email: doc.email,
    username: doc.username,
    role: doc.role,
    name: doc.name,
    contactInfo: doc.contactInfo,
    patientId: doc.patientId ? String(doc.patientId) : undefined,
    addedByUserId: doc.addedByUserId ? String(doc.addedByUserId) : undefined,
  }
}

export async function findUserByEmail(email: string): Promise<SafeUser | null> {
  const db = await getDb()
  const doc = await db.collection<UserDoc>(COLLECTION).findOne({ email: email.trim().toLowerCase() })
  if (!doc || !doc._id) return null
  return docToSafeUser(doc as UserDoc & { _id: ObjectId })
}

export async function findUserByUsername(username: string): Promise<(UserDoc & { _id: ObjectId }) | null> {
  const db = await getDb()
  const doc = await db.collection<UserDoc>(COLLECTION).findOne({ username: username.trim().toLowerCase() })
  return doc && doc._id ? (doc as UserDoc & { _id: ObjectId }) : null
}

export async function findUserById(id: string): Promise<SafeUser | null> {
  if (!ObjectId.isValid(id)) return null
  const db = await getDb()
  const doc = await db.collection<UserDoc>(COLLECTION).findOne({ _id: new ObjectId(id) })
  if (!doc || !doc._id) return null
  return docToSafeUser(doc as UserDoc & { _id: ObjectId })
}

export async function verifyPassword(userDoc: UserDoc & { _id: ObjectId }, password: string): Promise<boolean> {
  return bcrypt.compare(password, userDoc.passwordHash)
}

export async function createNurseUser(params: {
  email: string
  password: string
  name?: string
}): Promise<{ ok: boolean; error?: string; userId?: string }> {
  const db = await getDb()
  const email = params.email.trim().toLowerCase()
  const existing = await db.collection<UserDoc>(COLLECTION).findOne({ email })
  if (existing) return { ok: false, error: "An account with this email already exists." }
  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS)
  const { insertedId } = await db.collection<UserDoc>(COLLECTION).insertOne({
    email,
    passwordHash,
    role: "nurse",
    name: params.name?.trim(),
  } as UserDoc)
  return { ok: true, userId: insertedId.toString() }
}

export async function createPatientUser(params: {
  username: string
  password: string
  addedByUserId: string
  patientId: string
}): Promise<{ ok: boolean; error?: string; userId?: string }> {
  const db = await getDb()
  const username = params.username.trim().toLowerCase()
  const existing = await db.collection<UserDoc>(COLLECTION).findOne({ username })
  if (existing) return { ok: false, error: "This username is already taken." }
  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS)
  const { insertedId } = await db.collection<UserDoc>(COLLECTION).insertOne({
    username,
    passwordHash,
    role: "patient",
    addedByUserId: new ObjectId(params.addedByUserId),
    patientId: new ObjectId(params.patientId),
  } as UserDoc)
  return { ok: true, userId: insertedId.toString() }
}

export async function updateContactInfo(userId: string, contactInfo: ContactInfo): Promise<{ ok: boolean; error?: string }> {
  const db = await getDb()
  const result = await db
    .collection<UserDoc>(COLLECTION)
    .updateOne({ _id: new ObjectId(userId) }, { $set: { contactInfo } })
  if (result.matchedCount === 0) return { ok: false, error: "User not found." }
  return { ok: true }
}

/** Get patient's user (for contact info and username) by patient id */
export async function getPatientUserByPatientId(patientId: string): Promise<{
  username?: string
  contactInfo?: ContactInfo
} | null> {
  if (!ObjectId.isValid(patientId)) return null
  const db = await getDb()
  const doc = await db
    .collection<UserDoc>(COLLECTION)
    .findOne({ patientId: new ObjectId(patientId) })
  if (!doc) return null
  return {
    username: doc.username,
    contactInfo: doc.contactInfo,
  }
}

/** Get nurse user by id (for contact info on patient dashboard) */
export async function getNurseContactInfo(nurseUserId: string): Promise<ContactInfo | null> {
  const user = await findUserById(nurseUserId)
  return user?.contactInfo ?? null
}