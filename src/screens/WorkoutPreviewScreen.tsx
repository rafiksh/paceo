import { FC } from "react"
import { ScrollView, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { WorkoutDetailsSection } from "@/components/WorkoutDetailsSection"
import { WorkoutHeader } from "@/components/WorkoutHeader"
import { WorkoutInfoSection } from "@/components/WorkoutInfoSection"
import { type SavedWorkout } from "@/services/WorkoutStorage"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface WorkoutPreviewScreenProps {
  workout: SavedWorkout
  onClose: () => void
}

export const WorkoutPreviewScreen: FC<WorkoutPreviewScreenProps> = function WorkoutPreviewScreen({
  workout,
  onClose,
}) {
  const { themed } = useAppTheme()
  const { workoutPlan } = workout

  // Debug logging
  console.log("Workout Plan:", JSON.stringify(workoutPlan, null, 2))
  console.log("Workout Type:", workoutPlan.type)
  // Type-safe access to workout properties
  const workoutData = workoutPlan.workout
  if (workoutData && "blocks" in workoutData) {
    console.log("Workout Blocks:", workoutData.blocks)
  }
  if (workoutData && "warmup" in workoutData) {
    console.log("Workout Warmup:", workoutData.warmup)
  }
  if (workoutData && "cooldown" in workoutData) {
    console.log("Workout Cooldown:", workoutData.cooldown)
  }

  return (
    <Screen
      style={themed($container)}
      preset="fixed"
      contentContainerStyle={themed($contentContainer)}
    >
      <WorkoutHeader title={workout.name} workoutType={workoutPlan.type} onClose={onClose} />

      <ScrollView contentContainerStyle={themed($workoutDetails)}>
        <WorkoutDetailsSection workoutType={workoutPlan.type} workout={workoutPlan.workout} />
        <WorkoutInfoSection
          activity={workout.activity}
          location={workout.location as "indoor" | "outdoor"}
          createdAt={workout.createdAt}
        />
      </ScrollView>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.lg,
})

const $workoutDetails: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
})
