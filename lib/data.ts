// ── Types ──────────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high" | "critical"

export interface Patient {
  id: string
  name: string
  age: number
  conditions: string[]
  priorHospitalizations: number
  riskScore: number
  riskTrend: "up" | "down" | "stable"
  lastVisitDate: string
  status: "active" | "discharged"
  imageInitials: string
}

export interface Visit {
  id: string
  patientId: string
  date: string
  nurseNote: string
  vitalsBP: string
  symptoms: string[]
  riskScoreBefore: number
  riskScoreAfter: number
  soapNote?: { subjective: string; objective: string; assessment: string; plan: string }
  riskFactors?: { factor: string; severity: "critical" | "high"; detail: string }[]
  voiceSummary?: string
}

export interface RiskHistoryPoint {
  date: string
  score: number
}

export interface BPHistoryPoint {
  date: string
  systolic: number
  diastolic: number
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  adherencePercent: number
  lastTaken: string
}

export interface PatientDetail {
  patient: Patient
  riskHistory: RiskHistoryPoint[]
  bpHistory: BPHistoryPoint[]
  medications: Medication[]
  visits: Visit[]
  /** Latest visit summary text (for patient to play) */
  lastVoiceSummary?: string | null
  /** Date of latest summary (ISO) */
  lastVoiceSummaryAt?: string | null
}

// ── Helpers ────────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** Format an ISO date string (YYYY-MM-DD) to "Mon DD" without locale-dependent APIs. Returns "—" if empty or invalid. */
export function formatDate(dateStr: string): string {
  if (!dateStr || typeof dateStr !== "string") return "—"
  const parts = dateStr.split("-").map(Number)
  const [y, m, d] = parts
  if (parts.length < 3 || !m || m < 1 || m > 12 || !d || d < 1) return "—"
  return `${MONTHS[m - 1]} ${d}`
}

/** Format an ISO date string to "Mon DD, YYYY". Returns "—" if empty or invalid. */
export function formatDateLong(dateStr: string): string {
  if (!dateStr || typeof dateStr !== "string") return "—"
  const parts = dateStr.split("-").map(Number)
  const [y, m, d] = parts
  if (parts.length < 3 || !m || m < 1 || m > 12 || !d || d < 1) return "—"
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split("T")[0]
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "critical"
  if (score >= 50) return "high"
  if (score >= 30) return "medium"
  return "low"
}

export function getRiskColor(score: number): string {
  const level = getRiskLevel(score)
  switch (level) {
    case "critical": return "var(--risk-critical)"
    case "high": return "var(--risk-high)"
    case "medium": return "var(--risk-medium)"
    case "low": return "var(--risk-low)"
  }
}

export function getRiskLabel(score: number): string {
  const level = getRiskLevel(score)
  switch (level) {
    case "critical": return "Critical"
    case "high": return "High"
    case "medium": return "Medium"
    case "low": return "Low"
  }
}

// ── Patient List ───────────────────────────────────────────────────────────

export const patients: Patient[] = [
  {
    id: "mary-thompson",
    name: "Mary Thompson",
    age: 74,
    conditions: ["CHF", "Hypertension", "Type 2 Diabetes"],
    priorHospitalizations: 2,
    riskScore: 42,
    riskTrend: "up",
    lastVisitDate: daysAgo(2),
    status: "active",
    imageInitials: "MT",
  },
  {
    id: "robert-chen",
    name: "Robert Chen",
    age: 68,
    conditions: ["COPD", "Hypertension"],
    priorHospitalizations: 1,
    riskScore: 35,
    riskTrend: "stable",
    lastVisitDate: daysAgo(3),
    status: "active",
    imageInitials: "RC",
  },
  {
    id: "linda-garcia",
    name: "Linda Garcia",
    age: 71,
    conditions: ["Post-op Hip Replacement"],
    priorHospitalizations: 0,
    riskScore: 18,
    riskTrend: "down",
    lastVisitDate: daysAgo(1),
    status: "active",
    imageInitials: "LG",
  },
]

// ── Mary Thompson Detail Data ──────────────────────────────────────────────

const maryRiskHistory: RiskHistoryPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: daysAgo(29 - i),
  score: Math.round(28 + (i / 29) * 14 + Math.sin(i * 0.5) * 3),
}))

const maryBPHistory: BPHistoryPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: daysAgo(29 - i),
  systolic: Math.round(135 + Math.sin(i * 0.4) * 10 + (i / 29) * 8),
  diastolic: Math.round(82 + Math.sin(i * 0.3) * 5 + (i / 29) * 4),
}))

const maryMedications: Medication[] = [
  { name: "Lisinopril", dosage: "20mg", frequency: "Once daily", adherencePercent: 88, lastTaken: daysAgo(0) },
  { name: "Metformin", dosage: "500mg", frequency: "Twice daily", adherencePercent: 72, lastTaken: daysAgo(0) },
  { name: "Furosemide", dosage: "40mg", frequency: "Once daily", adherencePercent: 65, lastTaken: daysAgo(1) },
  { name: "Carvedilol", dosage: "12.5mg", frequency: "Twice daily", adherencePercent: 91, lastTaken: daysAgo(0) },
  { name: "Atorvastatin", dosage: "40mg", frequency: "Once daily", adherencePercent: 95, lastTaken: daysAgo(0) },
]

const maryVisits: Visit[] = [
  {
    id: "v1", patientId: "mary-thompson", date: daysAgo(2),
    nurseNote: "Patient reports increasing shortness of breath when climbing stairs. Slight edema noted in lower extremities. Weight up 2 lbs from last visit.",
    vitalsBP: "148/90", symptoms: ["Dyspnea on exertion", "Peripheral edema", "Weight gain"],
    riskScoreBefore: 38, riskScoreAfter: 42,
  },
  {
    id: "v2", patientId: "mary-thompson", date: daysAgo(9),
    nurseNote: "Patient compliant with medication regime. Reports occasional dizziness in the morning. Blood glucose levels slightly elevated.",
    vitalsBP: "140/86", symptoms: ["Morning dizziness", "Elevated glucose"],
    riskScoreBefore: 35, riskScoreAfter: 38,
  },
  {
    id: "v3", patientId: "mary-thompson", date: daysAgo(16),
    nurseNote: "Routine check-in. Patient in good spirits. Vitals stable. Medication adherence improving after pharmacist consultation.",
    vitalsBP: "136/84", symptoms: [],
    riskScoreBefore: 34, riskScoreAfter: 35,
  },
  {
    id: "v4", patientId: "mary-thompson", date: daysAgo(23),
    nurseNote: "Patient missed furosemide for 2 days. Mild ankle swelling observed. Educated patient on importance of diuretic compliance.",
    vitalsBP: "142/88", symptoms: ["Medication non-compliance", "Ankle swelling"],
    riskScoreBefore: 30, riskScoreAfter: 34,
  },
]

// ── Robert Chen Detail Data ────────────────────────────────────────────────

const robertRiskHistory: RiskHistoryPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: daysAgo(29 - i),
  score: Math.round(33 + Math.sin(i * 0.3) * 4),
}))

const robertBPHistory: BPHistoryPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: daysAgo(29 - i),
  systolic: Math.round(130 + Math.sin(i * 0.35) * 8),
  diastolic: Math.round(80 + Math.sin(i * 0.25) * 4),
}))

const robertMedications: Medication[] = [
  { name: "Tiotropium", dosage: "18mcg", frequency: "Once daily (inhaler)", adherencePercent: 94, lastTaken: daysAgo(0) },
  { name: "Albuterol", dosage: "90mcg", frequency: "As needed", adherencePercent: 100, lastTaken: daysAgo(1) },
  { name: "Amlodipine", dosage: "10mg", frequency: "Once daily", adherencePercent: 89, lastTaken: daysAgo(0) },
]

const robertVisits: Visit[] = [
  {
    id: "v5", patientId: "robert-chen", date: daysAgo(3),
    nurseNote: "Patient reports stable breathing. Using inhaler as prescribed. Occasional mild wheezing in the evenings.",
    vitalsBP: "132/82", symptoms: ["Mild evening wheezing"],
    riskScoreBefore: 35, riskScoreAfter: 35,
  },
  {
    id: "v6", patientId: "robert-chen", date: daysAgo(10),
    nurseNote: "Pulmonary function stable. Patient exercising with walking program 3x/week. Good spirits.",
    vitalsBP: "128/80", symptoms: [],
    riskScoreBefore: 36, riskScoreAfter: 35,
  },
  {
    id: "v7", patientId: "robert-chen", date: daysAgo(17),
    nurseNote: "Seasonal allergy exacerbation noted. Increased albuterol usage. Advised to monitor closely.",
    vitalsBP: "134/84", symptoms: ["Increased wheezing", "Allergic rhinitis"],
    riskScoreBefore: 33, riskScoreAfter: 36,
  },
]

// ── Linda Garcia Detail Data ───────────────────────────────────────────────

const lindaRiskHistory: RiskHistoryPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: daysAgo(29 - i),
  score: Math.round(24 - (i / 29) * 6 + Math.sin(i * 0.4) * 2),
}))

const lindaBPHistory: BPHistoryPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: daysAgo(29 - i),
  systolic: Math.round(122 + Math.sin(i * 0.3) * 6),
  diastolic: Math.round(76 + Math.sin(i * 0.2) * 3),
}))

const lindaMedications: Medication[] = [
  { name: "Acetaminophen", dosage: "500mg", frequency: "Every 6 hours as needed", adherencePercent: 82, lastTaken: daysAgo(0) },
  { name: "Enoxaparin", dosage: "40mg", frequency: "Once daily (injection)", adherencePercent: 100, lastTaken: daysAgo(0) },
  { name: "Calcium + Vitamin D", dosage: "600mg/400IU", frequency: "Twice daily", adherencePercent: 78, lastTaken: daysAgo(0) },
  { name: "Omeprazole", dosage: "20mg", frequency: "Once daily", adherencePercent: 90, lastTaken: daysAgo(0) },
]

const lindaVisits: Visit[] = [
  {
    id: "v8", patientId: "linda-garcia", date: daysAgo(1),
    nurseNote: "Post-op day 18. Patient ambulating well with walker. Pain well-controlled. Incision site healing without signs of infection.",
    vitalsBP: "120/76", symptoms: [],
    riskScoreBefore: 19, riskScoreAfter: 18,
  },
  {
    id: "v9", patientId: "linda-garcia", date: daysAgo(8),
    nurseNote: "Physical therapy progress excellent. Range of motion improving. Patient reports decreased need for pain medication.",
    vitalsBP: "124/78", symptoms: ["Mild surgical site discomfort"],
    riskScoreBefore: 21, riskScoreAfter: 19,
  },
  {
    id: "v10", patientId: "linda-garcia", date: daysAgo(15),
    nurseNote: "Post-op day 4. Patient resting comfortably. Drain removed. Beginning physical therapy exercises.",
    vitalsBP: "126/80", symptoms: ["Post-surgical pain", "Limited mobility"],
    riskScoreBefore: 24, riskScoreAfter: 21,
  },
]

// ── Lookup Functions ───────────────────────────────────────────────────────

const patientDetails: Record<string, PatientDetail> = {
  "mary-thompson": { patient: patients[0], riskHistory: maryRiskHistory, bpHistory: maryBPHistory, medications: maryMedications, visits: maryVisits },
  "robert-chen": { patient: patients[1], riskHistory: robertRiskHistory, bpHistory: robertBPHistory, medications: robertMedications, visits: robertVisits },
  "linda-garcia": { patient: patients[2], riskHistory: lindaRiskHistory, bpHistory: lindaBPHistory, medications: lindaMedications, visits: lindaVisits },
}

export function getPatientDetail(id: string): PatientDetail | undefined {
  return patientDetails[id]
}

export function getPatientsSortedByRisk(): Patient[] {
  return [...patients].sort((a, b) => b.riskScore - a.riskScore)
}

// ── Simulated AI Analysis Results (for Mary only) ──────────────────────────

export const simulatedAnalysis = {
  newRiskScore: 79,
  riskFactors: [
    { factor: "Significant weight gain (4 lbs in 48 hours)", severity: "critical" as const, detail: "Indicates fluid retention consistent with CHF exacerbation" },
    { factor: "Blood pressure elevated at 162/96", severity: "high" as const, detail: "Above target range despite current antihypertensive regimen" },
    { factor: "New bilateral crackles on auscultation", severity: "critical" as const, detail: "Suggests pulmonary congestion, possible early pulmonary edema" },
    { factor: "Furosemide adherence dropped to 50%", severity: "high" as const, detail: "Patient reports forgetting evening doses consistently" },
    { factor: "Increased dyspnea at rest", severity: "critical" as const, detail: "Progression from exertional to resting dyspnea indicates worsening heart failure" },
  ],
  soapNote: {
    subjective: "Patient reports worsening shortness of breath over past 2 days, now present at rest. Unable to sleep flat, using 3 pillows. Reports swelling in both ankles. States she has been forgetting her evening furosemide dose.",
    objective: "VS: BP 162/96, HR 98, RR 22, SpO2 93% on RA, Temp 98.4F. Weight: 168 lbs (up 4 lbs from 2 days ago). Bilateral lower extremity edema 2+. Bilateral basilar crackles. JVD noted. S3 gallop present.",
    assessment: "Acute decompensated heart failure exacerbation. Likely precipitated by medication non-adherence and dietary indiscretion. Risk score elevated from 42% to 79%.",
    plan: "1. Contact PCP for urgent medication adjustment. 2. Reinforce daily weight monitoring. 3. Set up pill organizer for furosemide compliance. 4. Low-sodium diet education. 5. Follow-up visit in 24 hours. 6. Notify care coordinator for escalation.",
  },
  voiceSummary: "Mary is showing signs of acute heart failure decompensation. Her weight is up four pounds in two days, blood pressure is significantly elevated, and she has new crackles in both lungs. The main issue is she's been missing her evening diuretic doses. I've flagged her for urgent PCP follow-up and will see her again tomorrow.",
}
