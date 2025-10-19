import type { WorkoutPlan } from "expo-workoutkit"
import AsyncStorage from "@react-native-async-storage/async-storage"

const WORKOUTS_KEY = "@paceo_workouts"

export interface SavedWorkout {
  id: string
  name: string
  workoutPlan: WorkoutPlan
  createdAt: Date
  activity: string
  location: string
  origin: "ai" | "manual"
}

export class WorkoutStorage {
  static async saveWorkout(workout: SavedWorkout): Promise<void> {
    try {
      const existingWorkouts = await this.getWorkouts()
      const updatedWorkouts = [...existingWorkouts, workout]
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updatedWorkouts))
    } catch (error) {
      console.error("Error saving workout:", error)
      throw new Error("Failed to save workout")
    }
  }

  static async getWorkouts(): Promise<SavedWorkout[]> {
    try {
      const workoutsJson = await AsyncStorage.getItem(WORKOUTS_KEY)
      if (!workoutsJson) return []

      const workouts = JSON.parse(workoutsJson)
      // Convert createdAt strings back to Date objects
      return workouts.map((workout: Record<string, unknown>) => ({
        ...workout,
        createdAt: new Date(workout.createdAt as string),
        origin: (workout.origin as "ai" | "manual" | undefined) ?? "manual",
      }))
    } catch (error) {
      console.error("Error loading workouts:", error)
      return []
    }
  }

  static async deleteWorkout(id: string): Promise<void> {
    try {
      const existingWorkouts = await this.getWorkouts()
      const updatedWorkouts = existingWorkouts.filter((workout) => workout.id !== id)
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updatedWorkouts))
    } catch (error) {
      console.error("Error deleting workout:", error)
      throw new Error("Failed to delete workout")
    }
  }

  static async updateWorkout(id: string, updatedWorkout: Partial<SavedWorkout>): Promise<void> {
    try {
      const existingWorkouts = await this.getWorkouts()
      const updatedWorkouts = existingWorkouts.map((workout) =>
        workout.id === id ? { ...workout, ...updatedWorkout } : workout,
      )
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updatedWorkouts))
    } catch (error) {
      console.error("Error updating workout:", error)
      throw new Error("Failed to update workout")
    }
  }

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}
