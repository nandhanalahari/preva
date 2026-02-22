# Preva

**Proactive home health monitoring that keeps patients safe between visits.**

Preva is a full-stack home health platform that gives nurses real-time risk intelligence, AI-powered clinical documentation, and seamless nurse-patient communication — so no patient falls through the cracks.

---

## The Problem

Home health nurses visit patients weekly or biweekly. Between visits, patients managing chronic conditions like heart failure, COPD, or diabetes are largely on their own. A missed medication, a blood pressure spike, or new symptoms can go unnoticed for days — turning what could have been a simple intervention into an ER visit or hospital readmission.

## The Solution

Preva bridges the gap between nurse visits with AI-powered risk monitoring, real-time communication, and intelligent documentation that lets nurses focus on caring instead of charting.

---

## Features

### Nurse Experience

| Feature | Description |
|---------|-------------|
| **Patient Dashboard** | Risk-sorted overview of all patients with stats: total patients, high-risk count, visits today, average risk score |
| **AI Visit Documentation** | Type or dictate a clinical note → Gemini generates a SOAP note, risk factors, updated risk score, and a plain-language voice summary for the patient |
| **Risk Reasoning** | AI-generated explanation of why a patient's risk score is what it is, considering full visit history |
| **Drag-and-Drop Calendar** | Week/day/month/agenda views for scheduling and managing patient appointments |
| **In-App Messaging** | Real-time chat with individual patients |
| **Condition Report Replies** | Reply directly to patient-submitted voice condition reports |
| **Blood Pressure Recording** | Record and track BP readings over time with trend visualization |

### Patient Experience

| Feature | Description |
|---------|-------------|
| **Personal Dashboard** | Risk score with gauge and trend, BP charts, medications, and daily AI-generated care summaries |
| **Voice Condition Reports** | Record voice messages about symptoms — send raw transcript to nurse or have AI extract symptoms first |
| **Visit History** | Full timeline of past visits with expandable SOAP notes, risk factors, and risk score changes |
| **Daily Summary** | AI-generated "what you need to do today" with medications, risk level, and practical reminders |
| **Voice Playback** | Listen to a warm, plain-language audio summary of the latest nurse visit (powered by ElevenLabs) |
| **Nurse Replies** | See nurse replies to condition reports inline |
| **Appointments** | View upcoming scheduled appointments |

### AI Capabilities

- **Clinical Note Analysis** — Structured SOAP note generation with risk scoring from free-text nurse notes
- **Risk Factor Extraction** — Identifies and categorizes risk factors with severity levels (critical/high)
- **Symptom Extraction** — Parses patient voice messages for mentioned symptoms
- **Risk Reasoning** — Evidence-based explanation of risk scores considering visit history trends
- **Daily Care Summaries** — Personalized daily action items for patients
- **Voice Summary** — Plain-language visit summaries synthesized to audio

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, React Server Components, Server Actions) |
| **Language** | TypeScript |
| **Database** | MongoDB Atlas |
| **Authentication** | NextAuth v5 (role-based: nurse / patient) |
| **AI** | Google Gemini 2.5 Flash (clinical analysis, risk reasoning, summaries) |
| **Speech** | ElevenLabs (speech-to-text transcription, text-to-speech synthesis) |
| **UI** | Tailwind CSS, shadcn/ui (50+ Radix components), Lucide icons |
| **Charts** | Recharts (risk trends, blood pressure) |
| **Calendar** | react-big-calendar with drag-and-drop |
| **Deployment** | Any Node.js hosting (Vercel, Railway, etc.) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- API keys: Gemini, ElevenLabs

### Setup

1. **Clone and install**

```bash
git clone https://github.com/nandhanalahari/preva.git
cd preva
npm install
```

2. **Configure environment**

```bash
cp .env.example .env.local
```

Fill in your keys in `.env.local`:

```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
GEMINI_API_KEY=your-gemini-key
ELEVENLABS_API_KEY=your-elevenlabs-key
```

3. **Seed the database**

```bash
node scripts/seed-mongo.mjs
node scripts/seed-auth.mjs
```

4. **Run**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Credentials

After running the seed scripts:

| Role | Login | Password |
|------|-------|----------|
| **Nurse** | `nandhu.alahari@gmail.com` | `nurse123` |
| **Patient** | `mary.t` (or `robert.c`, `linda.g`) | `patient123` |

---

## Architecture

```
preva/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── signin/ & signup/           # Authentication
│   ├── dashboard/                  # Nurse dashboard
│   ├── patient-dashboard/          # Patient dashboard
│   ├── patients/[id]/              # Patient detail (nurse view)
│   ├── messages/                   # In-app messaging
│   ├── calendar/                   # Appointment scheduling
│   └── actions/                    # Server Actions (12 modules)
│       ├── analyze-visit-note.ts   # Gemini: SOAP notes, risk scoring
│       ├── risk-reasoning.ts       # Gemini: risk score explanations
│       ├── generate-daily-summary.ts # Gemini: daily care summaries
│       ├── patient-messages.ts     # Voice message handling + AI analysis
│       ├── chat.ts                 # Real-time messaging
│       ├── appointments.ts         # Calendar CRUD
│       ├── elevenlabs.ts           # STT + TTS
│       └── ...                     # Auth, patients, BP, contacts
├── components/                     # 30+ React components
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   ├── mongodb.ts                  # Database schemas & connection
│   ├── patients.ts                 # Patient data fetching
│   └── data.ts                     # Types & utilities
└── public/                         # Static assets
```

---

## How the AI Works

Preva uses **Gemini 2.5 Flash** with two prompting strategies:

**Structured output** (visit analysis, symptom extraction): Uses Gemini's `responseSchema` to force JSON output matching a defined schema. The model returns exactly the fields needed — risk score, SOAP note sections, risk factors — with type safety enforced.

**Grounded generation** (risk reasoning, daily summaries): Injects real patient data from MongoDB (visit history, medications, conditions, risk trends) into the prompt and asks for plain-text output. Every prompt includes explicit grounding instructions: "use ONLY information provided, do not infer or assume."

All AI outputs are validated and sanitized server-side — risk scores are clamped to 0-100, arrays are defaulted, types are coerced.
