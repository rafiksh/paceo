import type { CustomWorkout } from "expo-workoutkit"
import { z } from "zod"

// Base form data that all workout types share
const baseWorkoutSchema = z.object({
  workoutName: z.string().min(1, "Workout name is required"),
  selectedLocation: z.enum(["indoor", "outdoor", "unknown"]),
})

// Simple/Goal Workout Form Data
const simpleWorkoutSchema = baseWorkoutSchema.extend({
  goal: z.object({
    type: z.enum(["time", "distance", "energy"]),
    value: z.number().min(1, "Value is required"),
    unit: z.string().min(1, "Unit is required"),
  }),
})

// Pacer Workout Form Data
const pacerWorkoutSchema = baseWorkoutSchema.extend({
  distance: z.object({
    value: z.number().min(1, "Distance is required"),
    unit: z.string().min(1, "Distance unit is required"),
  }),
  time: z.object({
    value: z.number().min(1, "Time is required"),
    unit: z.string().min(1, "Time unit is required"),
  }),
})

// Custom Workout Form Data
const customWorkoutSchema = baseWorkoutSchema.extend({
  customWorkout: z.custom<CustomWorkout>().optional(),
})

// Export the inferred types
export type SimpleWorkoutFormData = z.infer<typeof simpleWorkoutSchema>
export type PacerWorkoutFormData = z.infer<typeof pacerWorkoutSchema>
export type CustomWorkoutFormData = z.infer<typeof customWorkoutSchema>

// Union type for all workout form data
export type WorkoutFormData = SimpleWorkoutFormData | PacerWorkoutFormData | CustomWorkoutFormData

// Export the schemas for validation
export { simpleWorkoutSchema, pacerWorkoutSchema, customWorkoutSchema }

// Type guards to check which form data type we're dealing with
export const isSimpleWorkoutData = (data: WorkoutFormData): data is SimpleWorkoutFormData => {
  return "goal" in data
}

export const isPacerWorkoutData = (data: WorkoutFormData): data is PacerWorkoutFormData => {
  return "distance" in data && "time" in data
}

export const isCustomWorkoutData = (data: WorkoutFormData): data is CustomWorkoutFormData => {
  return "customWorkout" in data
}
