/**
 * Seed nurse + patients with login credentials.
 * Run: MONGODB_URI="..." node scripts/seed-auth.mjs
 * Creates: nurse nandhu.alahari@gmail.com / nurse123, and 3 patients with usernames mary.t, robert.c, linda.g / patient123
 */
import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

const uri = process.env.MONGODB_URI || "mongodb+srv://preva:preva123@cluster0.kda0vy4.mongodb.net/preva?retryWrites=true&w=majority"
const SALT_ROUNDS = 10

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split("T")[0]
}

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db("preva")
  const usersColl = db.collection("users")
  const patientsColl = db.collection("patients")

  const existingNurse = await usersColl.findOne({ email: "nandhu.alahari@gmail.com" })
  if (existingNurse) {
    console.log("Nurse user already exists. Skipping auth seed.")
    await client.close()
    return
  }

  const nursePasswordHash = await bcrypt.hash("nurse123", SALT_ROUNDS)
  const { insertedId: nurseId } = await usersColl.insertOne({
    email: "nandhu.alahari@gmail.com",
    passwordHash: nursePasswordHash,
    role: "nurse",
    name: "Nandhu Alahari",
    contactInfo: {
      phone: "(555) 100-2000",
      address: "123 Care Lane, Clinic City, CC 12345",
      emergencyContact: "Clinic front desk (555) 100-2001",
    },
  })
  console.log("Created nurse user:", nurseId.toString())

  const patientPasswordHash = await bcrypt.hash("patient123", SALT_ROUNDS)
  const patientData = [
    {
      name: "Mary Thompson",
      age: 74,
      conditions: ["CHF", "Hypertension", "Type 2 Diabetes"],
      priorHospitalizations: 2,
      riskScore: 42,
      riskTrend: "up",
      lastVisitDate: daysAgo(2),
      status: "active",
      imageInitials: "MT",
      medications: [
        { name: "Lisinopril", dosage: "20mg", frequency: "Once daily" },
        { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
        { name: "Furosemide", dosage: "40mg", frequency: "Once daily" },
      ],
      username: "mary.t",
      contactInfo: { phone: "(555) 111-2222", address: "456 Home St, City, ST 67890" },
    },
    {
      name: "Robert Chen",
      age: 68,
      conditions: ["COPD", "Hypertension"],
      priorHospitalizations: 1,
      riskScore: 35,
      riskTrend: "stable",
      lastVisitDate: daysAgo(3),
      status: "active",
      imageInitials: "RC",
      medications: [
        { name: "Tiotropium", dosage: "18mcg", frequency: "Once daily (inhaler)" },
        { name: "Albuterol", dosage: "90mcg", frequency: "As needed" },
        { name: "Amlodipine", dosage: "10mg", frequency: "Once daily" },
      ],
      username: "robert.c",
      contactInfo: { phone: "(555) 222-3333" },
    },
    {
      name: "Linda Garcia",
      age: 71,
      conditions: ["Post-op Hip Replacement"],
      priorHospitalizations: 0,
      riskScore: 18,
      riskTrend: "down",
      lastVisitDate: daysAgo(1),
      status: "active",
      imageInitials: "LG",
      medications: [
        { name: "Acetaminophen", dosage: "500mg", frequency: "Every 6 hours as needed" },
        { name: "Enoxaparin", dosage: "40mg", frequency: "Once daily (injection)" },
        { name: "Calcium + Vitamin D", dosage: "600mg/400IU", frequency: "Twice daily" },
      ],
      username: "linda.g",
      contactInfo: { phone: "(555) 333-4444", address: "789 Oak Ave" },
    },
  ]

  for (const p of patientData) {
    const { username, contactInfo, ...patientFields } = p
    const { insertedId: patientId } = await patientsColl.insertOne({
      ...patientFields,
      addedByUserId: nurseId,
    })
    const { insertedId: userId } = await usersColl.insertOne({
      username,
      passwordHash: patientPasswordHash,
      role: "patient",
      addedByUserId: nurseId,
      patientId,
      contactInfo: contactInfo || {},
    })
    await patientsColl.updateOne({ _id: patientId }, { $set: { userId } })
    console.log("Created patient:", patientFields.name, "username:", username)
  }

  console.log("Auth seed done.")
console.log("  Nurse:    nandhu.alahari@gmail.com  /  nurse123")
console.log("  Patients: mary.t, robert.c, linda.g  /  patient123")
  await client.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
