import type { CustomWorkout, SingleGoalWorkout } from "expo-workoutkit"

// Type guards for workout types
export const isCustomWorkout = (workout: unknown): workout is CustomWorkout => {
  return Boolean(workout && typeof workout === "object" && "blocks" in workout)
}

export const isSingleGoalWorkout = (workout: unknown): workout is SingleGoalWorkout => {
  return Boolean(workout && typeof workout === "object" && "goal" in workout)
}

// Helper functions for extracting workout data
export const getGoalDisplay = (goal: unknown): string => {
  if (!goal || typeof goal !== "object") return "No goal set"
  const goalObj = goal as Record<string, unknown>
  if (goalObj.type === "open") return "Open goal"
  return `${goalObj.value || 0} ${goalObj.unit || ""}`
}

export const getAlertDisplay = (alert: unknown): string => {
  if (!alert || typeof alert !== "object") return ""
  const alertObj = alert as Record<string, unknown>
  const target = alertObj.target as Record<string, unknown> | undefined
  if (!target) return `${alertObj.type} alert`
  return `${alertObj.type} alert (${target.min}-${target.max} ${target.unit})`
}

export const getStepDisplay = (
  step: unknown,
): { duration: string; purpose: string; alerts: string[] } => {
  if (!step || typeof step !== "object") {
    return { duration: "No duration", purpose: "Unknown", alerts: [] }
  }
  const stepObj = step as Record<string, unknown>
  const goal = stepObj.step ? (stepObj.step as Record<string, unknown>).goal : stepObj.goal
  const duration = getGoalDisplay(goal)
  const purpose = (stepObj.purpose as string) || "Unknown"
  const alerts =
    stepObj.step && (stepObj.step as Record<string, unknown>).alert
      ? [getAlertDisplay((stepObj.step as Record<string, unknown>).alert)]
      : []

  return { duration, purpose, alerts }
}

export const getBlockSummary = (
  block: unknown,
): { iterations: number; totalSteps: number; stepTypes: string[] } => {
  if (!block || typeof block !== "object") {
    return { iterations: 0, totalSteps: 0, stepTypes: [] }
  }
  const blockObj = block as Record<string, unknown>
  const iterations = (blockObj.iterations as number) || 0
  const steps = (blockObj.steps as unknown[]) || []
  const totalSteps = steps.length
  const stepTypes = steps.map((step: unknown) => {
    if (step && typeof step === "object") {
      const stepObj = step as Record<string, unknown>
      return (stepObj.purpose as string) || "Unknown"
    }
    return "Unknown"
  })

  return { iterations, totalSteps, stepTypes }
}

export const ACTIVITY_CATEGORIES = {
  cardio: [
    { value: "running", label: "Running", icon: "🏃‍♂️", color: "#FF6B6B" },
    { value: "cycling", label: "Cycling", icon: "🚴‍♂️", color: "#4ECDC4" },
    { value: "swimming", label: "Swimming", icon: "🏊‍♂️", color: "#45B7D1" },
    { value: "walking", label: "Walking", icon: "🚶‍♂️", color: "#96CEB4" },
    { value: "mixedCardio", label: "Mixed Cardio", icon: "💪", color: "#FECA57" },
  ],
  strength: [
    { value: "strengthTraining", label: "Strength", icon: "🏋️‍♂️", color: "#FF9FF3" },
    { value: "yoga", label: "Yoga", icon: "🧘‍♀️", color: "#A8E6CF" },
    { value: "pilates", label: "Pilates", icon: "🤸‍♀️", color: "#FFD93D" },
    { value: "crossTraining", label: "Cross Training", icon: "⚡", color: "#FF6B9D" },
  ],
  sports: [
    { value: "tennis", label: "Tennis", icon: "🎾", color: "#6C5CE7" },
    { value: "basketball", label: "Basketball", icon: "🏀", color: "#FD79A8" },
    { value: "soccer", label: "Soccer", icon: "⚽", color: "#00B894" },
    { value: "boxing", label: "Boxing", icon: "🥊", color: "#E17055" },
  ],
}

export const getActivityEmoji = (activity: string) => {
  const activityCategory = Object.values(ACTIVITY_CATEGORIES).find((category) =>
    category.some((a) => a.value === activity),
  )
  const activityIcon = activityCategory?.find((a) => a.value === activity)?.icon
  if (!activityIcon) return "🏃‍♂️‍➡️"

  return activityIcon
}
