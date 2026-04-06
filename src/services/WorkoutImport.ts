import type { WorkoutPlan } from "expo-workoutkit"
import pako from "pako"

import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"

export type WorkoutLinkPayload = {
  v: number
  n: string
  p: WorkoutPlan
}

export function decodePayload(data: string): WorkoutLinkPayload {
  try {
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/")
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const json = pako.inflate(bytes, { to: "string" })
    const parsed = JSON.parse(json)

    if (typeof parsed.v !== "number") throw new Error("Missing version")
    if (typeof parsed.n !== "string" || parsed.n.trim() === "") throw new Error("Missing name")
    if (!parsed.p || typeof parsed.p.type !== "string" || !parsed.p.workout)
      throw new Error("Missing workout plan")

    return parsed as WorkoutLinkPayload
  } catch {
    throw new Error("Invalid payload")
  }
}

export function toSavedWorkout(payload: WorkoutLinkPayload): SavedWorkout {
  return {
    id: WorkoutStorage.generateId(),
    name: payload.n.trim(),
    workoutPlan: payload.p,
    createdAt: new Date(),
    activity: payload.p.workout.activity,
    location: payload.p.workout.location,
    origin: "ai",
    status: "unscheduled",
  }
}
