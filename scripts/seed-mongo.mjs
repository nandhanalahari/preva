/**
 * Seed the three demo patients into MongoDB.
 * Run: MONGODB_URI="mongodb+srv://..." node scripts/seed-mongo.mjs
 */
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb+srv://preva:preva123@cluster0.kda0vy4.mongodb.net/preva?retryWrites=true&w=majority"

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split("T")[0]
}

const patients = [
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
  },
]

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db("preva")
  const coll = db.collection("patients")
  const existing = await coll.countDocuments()
  if (existing > 0) {
    console.log("Patients collection already has documents. Skipping seed.")
    await client.close()
    return
  }
  await coll.insertMany(patients)
  console.log("Inserted", patients.length, "demo patients.")
  await client.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
