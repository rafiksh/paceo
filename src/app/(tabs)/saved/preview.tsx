import { useState, useEffect, useCallback } from "react"
import { useLocalSearchParams, router } from "expo-router"

import { WorkoutPreviewScreen } from "@/screens/WorkoutPreviewScreen"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"

export default function WorkoutPreviewRoute() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>()
  const [workout, setWorkout] = useState<SavedWorkout | null>(null)
  const [loading, setLoading] = useState(true)

  const loadWorkout = useCallback(async () => {
    if (!workoutId) {
      router.back()
      return
    }

    try {
      const workouts = await WorkoutStorage.getWorkouts()
      const foundWorkout = workouts.find((w) => w.id === workoutId)

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
  }, [workoutId])

  useEffect(() => {
    loadWorkout()
  }, [loadWorkout])

  const handleClose = () => {
    router.back()
  }

  if (loading || !workout) {
    return null
  }

  return <WorkoutPreviewScreen workout={workout} onClose={handleClose} />
}
