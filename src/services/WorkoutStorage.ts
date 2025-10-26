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
  scheduledDate?: Date
  completedDate?: Date
  status?: "scheduled" | "completed" | "missed" | "unscheduled"
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
      // Convert date strings back to Date objects
      return workouts.map((workout: Record<string, unknown>) => ({
        ...workout,
        createdAt: new Date(workout.createdAt as string),
        scheduledDate: workout.scheduledDate
          ? new Date(workout.scheduledDate as string)
          : undefined,
        completedDate: workout.completedDate
          ? new Date(workout.completedDate as string)
          : undefined,
        origin: (workout.origin as "ai" | "manual" | undefined) ?? "manual",
        status:
          (workout.status as "scheduled" | "completed" | "missed" | "unscheduled" | undefined) ??
          "unscheduled",
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

  // Helper methods for filtering workouts
  static async getUpcomingWorkouts(): Promise<SavedWorkout[]> {
    const workouts = await this.getWorkouts()
    const now = new Date()
    return workouts
      .filter((w) => w.scheduledDate && w.scheduledDate >= now && w.status === "scheduled")
      .sort((a, b) => a.scheduledDate!.getTime() - b.scheduledDate!.getTime())
  }

  static async getCompletedWorkouts(): Promise<SavedWorkout[]> {
    const workouts = await this.getWorkouts()
    return workouts
      .filter((w) => w.status === "completed")
      .sort((a, b) => (b.completedDate?.getTime() || 0) - (a.completedDate?.getTime() || 0))
  }

  static async getWorkoutStats(): Promise<{
    totalCompleted: number
    thisWeekCompleted: number
    thisMonthCompleted: number
  }> {
    const workouts = await this.getCompletedWorkouts()
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      totalCompleted: workouts.length,
      thisWeekCompleted: workouts.filter((w) => w.completedDate && w.completedDate >= weekAgo)
        .length,
      thisMonthCompleted: workouts.filter((w) => w.completedDate && w.completedDate >= monthAgo)
        .length,
    }
  }
}
