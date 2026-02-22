# Preva — Proactive Home Health Monitoring

## Inspiration

Home health nurses visit patients in their homes — often elderly individuals managing chronic conditions like heart failure, COPD, or diabetes. Between visits, these patients are largely on their own. A missed medication, a spike in blood pressure, or a new symptom can go unnoticed for days or weeks until the next scheduled visit. By then, what could have been a simple intervention becomes an ER visit or a hospital readmission.

We built **Preva** because we believe the gap between nurse visits shouldn't be a blind spot. We wanted to create a platform where nurses have real-time risk intelligence at their fingertips, patients feel connected to their care team every day, and AI handles the documentation burden so nurses can focus on what matters — their patients.

## What It Does

Preva is a full-stack home health platform with two distinct experiences:

### For Nurses
- **Patient Dashboard** — A risk-sorted overview of all patients with at-a-glance stats (high risk count, active patients, upcoming visits)
- **AI Visit Documentation** — Nurses type or dictate a clinical note, and Gemini generates a complete SOAP note, risk factor analysis, updated risk score, and a plain-language voice summary for the patient
- **Scheduling** — A drag-and-drop calendar with week/day/month/agenda views for managing patient appointments
- **In-App Messaging** — Real-time chat with individual patients, plus the ability to reply to patient-submitted condition reports
- **Risk Reasoning** — AI-generated explanations of why a patient's risk score is what it is, considering their full visit history

### For Patients
- **Personal Dashboard** — Risk score with trend visualization, blood pressure charts, medications, and daily AI-generated care summaries
- **Voice Condition Reports** — Patients record voice messages about how they're feeling. They choose: send the raw transcript to their nurse, or have AI extract symptoms and summarize before sending
- **Visit History** — A full timeline of past visits with expandable SOAP notes, risk factor breakdowns, and risk score changes
- **Nurse Replies** — Patients see their nurse's replies to condition reports inline
- **Voice Playback** — After each visit, patients can play back a warm, plain-language audio summary of what the nurse discussed (powered by ElevenLabs TTS)

## How We Built It

### Architecture

```
Next.js 16 (App Router)
├── Server Components for pages (SSR, data fetching)
├── Server Actions for mutations (auth-gated, role-checked)
├── Client Components for interactivity (calendar, chat, recorders)
└── MongoDB Atlas for persistence
```

**Core stack:**
- **Next.js 16** with App Router, React Server Components, and Server Actions
- **MongoDB Atlas** — patients, visits, appointments, messages, chat
- **NextAuth** — role-based authentication (nurse vs. patient)
- **Gemini 2.5 Flash** — clinical note analysis, risk reasoning, daily summaries, symptom extraction
- **ElevenLabs** — speech-to-text (voice recording transcription) and text-to-speech (patient summaries)
- **Tailwind CSS + shadcn/ui** — component library with custom theming
- **Recharts** — risk trend and blood pressure visualizations
- **react-big-calendar** — drag-and-drop scheduling with custom styling

### AI Pipeline

The visit analysis pipeline is the heart of Preva. When a nurse submits a clinical note:

1. The note is sent to Gemini with strict grounding instructions — only use what's in the note
2. The model returns structured JSON: SOAP note, risk factors with severity, updated risk score, and a voice summary
3. The risk score is validated and clamped to $[0, 100]$
4. A `VisitDoc` is persisted to MongoDB with before/after risk scores
5. The patient's record is updated with the new risk score and trend
6. The voice summary is synthesized to audio via ElevenLabs and cached

For patient condition reports, a separate biomedical analysis extracts symptoms:

$$\text{Patient voice} \xrightarrow{\text{ElevenLabs STT}} \text{Transcript} \xrightarrow{\text{Gemini}} \{\text{symptoms}[], \text{summary}\}$$

### Real-Time Features

- **Optimistic UI** — Calendar drag-and-drop and chat messages update instantly, with background persistence and rollback on failure
- **Polling** — Chat messages, unread counts, and appointment lists poll at intervals for near-real-time updates
- **Role-based authorization** — Every server action validates the session and checks that nurses can only access their own patients, and patients can only access their own data

## Challenges We Faced

### Date Serialization Across the Server/Client Boundary
Next.js Server Actions serialize return values, which silently converts `Date` objects to strings. This caused calendar events and appointments to appear missing or malformed. We solved it by explicitly calling `.toISOString()` on all date parameters and creating a `toSafeDate()` helper that robustly parses dates from any format.

### Grounding the AI
Getting Gemini to stick *only* to what the nurse wrote was surprisingly difficult. A short note like "BP is up" would generate a full paragraph about heart failure, medications, and lifestyle changes. We iterated extensively on prompt engineering — adding explicit instructions, examples of what NOT to do, and structured output schemas — until the model reliably reflected only the input.

### Calendar UX
The `react-big-calendar` library is powerful but opinionated about styling. Aligning time labels with event blocks, adding subtle grid lines, and making the agenda view look polished required deep CSS overrides. We also had to implement optimistic drag-and-drop to eliminate the visual "snap back" that occurred while waiting for the server response.

### Role-Based Access Control
With two distinct user roles sharing the same codebase, every server action needed careful authorization. A nurse should only see their own patients. A patient should only see their own data and their assigned nurse. We built a `resolvePatientId` helper that enforces these rules consistently across chat, messages, appointments, and visit data.

## What We Learned

- **Server Components change everything** — fetching data at the page level and passing it down eliminates waterfalls and simplifies loading states
- **Optimistic UI is worth the complexity** — the perceived performance improvement from instant feedback is dramatic, even if the implementation requires careful rollback logic
- **AI needs guardrails** — structured output schemas and explicit grounding instructions are essential for reliable medical AI; the model *will* hallucinate without them
- **Small UI details matter** — subtle grid lines, proper time alignment, polished agenda views, and smooth animations are the difference between "prototype" and "product"

## What's Next

- **Medication interaction checker** using specialized drug interaction models
- **Predictive readmission risk** — using visit history trends to flag patients before they decline
- **Smart reply suggestions** in the nurse chat, powered by medical AI
- **Offline support** for nurses doing home visits in areas with poor connectivity
