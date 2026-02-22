"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import {
  getAppointments,
  createAppointment,
  updateAppointment as updateAppointmentDb,
  deleteAppointment as deleteAppointmentDb,
} from "@/lib/appointments"

export async function fetchAppointments(start: Date, end: Date, patientId?: string) {
  const session = await auth()
  if (!session?.user?.id) return []
  const role = (session.user as { role?: string }).role
  const startDate = start instanceof Date ? start : new Date(start)
  const endDate = end instanceof Date ? end : new Date(end)
  const range = { start: startDate, end: endDate }
  if (role === "nurse") {
    return getAppointments(range, { nurseUserId: session.user.id })
  }
  if (role === "patient" && patientId) {
    const userPatientId = (session.user as { patientId?: string }).patientId
    if (userPatientId !== patientId) return []
    return getAppointments(range, { patientId })
  }
  if (role === "patient") {
    const { findUserById } = await import("@/lib/users")
    const user = await findUserById(session.user.id)
    const id = user?.patientId?.toString()
    if (!id) return []
    return getAppointments(range, { patientId: id })
  }
  return []
}

export async function createAppointmentAction(
  patientId: string,
  start: Date | string,
  end: Date | string,
  title?: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role?: string }).role !== "nurse") {
    return { ok: false, error: "Unauthorized." }
  }
  const result = await createAppointment(session.user.id, patientId, start, end, title)
  if (result.ok) {
    revalidatePath("/calendar")
    revalidatePath("/patient-dashboard")
  }
  return result
}

export async function updateAppointmentAction(
  appointmentId: string,
  start: Date,
  end: Date
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role?: string }).role !== "nurse") {
    return { ok: false, error: "Unauthorized." }
  }
  const result = await updateAppointmentDb(appointmentId, start, end)
  if (result.ok) {
    revalidatePath("/calendar")
    revalidatePath("/patient-dashboard")
  }
  return result
}

export async function deleteAppointmentAction(appointmentId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role?: string }).role !== "nurse") {
    return { ok: false, error: "Unauthorized." }
  }
  const result = await deleteAppointmentDb(appointmentId)
  if (result.ok) {
    revalidatePath("/calendar")
    revalidatePath("/patient-dashboard")
  }
  return result
}
