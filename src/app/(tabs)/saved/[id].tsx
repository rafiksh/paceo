import { useState, useEffect, useCallback } from "react"
import { useLocalSearchParams, router } from "expo-router"

import { WorkoutPreviewScreen } from "@/screens/WorkoutPreviewScreen"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"

export default function WorkoutDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [workout, setWorkout] = useState<SavedWorkout | null>(null)
  const [loading, setLoading] = useState(true)

  const loadWorkout = useCallback(async () => {
    if (!id) {
      router.back()
      return
    }

    try {
      const workouts = await WorkoutStorage.getWorkouts()
      const foundWorkout = workouts.find((w) => w.id === id)

      if (!foundWorkout) {
        router.back()
        return
      }

      setWorkout(foundWorkout)
    } catch (error) {
      console.error("Error loading workout:", error)
      router.back()
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadWorkout()
  }, [loadWorkout])

  const handleClose = () => {
    router.back()
  }

  const handleEditDate = async (newDate: Date | undefined) => {
    if (!workout) return
    try {
      await WorkoutStorage.updateWorkout(workout.id, {
        scheduledDate: newDate,
        status: newDate ? "scheduled" : "unscheduled",
      })
      await loadWorkout()
    } catch (error) {
      console.error("Error updating date:", error)
    }
  }

  const handleMarkComplete = async () => {
    if (!workout) return
    try {
      await WorkoutStorage.updateWorkout(workout.id, {
        status: "completed",
        completedDate: new Date(),
      })
      await loadWorkout()
    } catch (error) {
      console.error("Error marking complete:", error)
    }
  }

  const handleDelete = async () => {
    if (!workout) return
    try {
      await WorkoutStorage.deleteWorkout(workout.id)
      router.back()
    } catch (error) {
      console.error("Error deleting workout:", error)
    }
  }

  if (loading || !workout) {
    return null
  }

  return (
    <WorkoutPreviewScreen
      workout={workout}
      onClose={handleClose}
      onEditDate={handleEditDate}
      onMarkComplete={handleMarkComplete}
      onDelete={handleDelete}
    />
  )
}
