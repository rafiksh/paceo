import { FC } from "react"
import { View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { WorkoutHeader } from "@/components/WorkoutHeader"
import { WorkoutTypeSection } from "@/components/WorkoutTypeSection"
import { WorkoutDetailsSection } from "@/components/WorkoutDetailsSection"
import { WorkoutInfoSection } from "@/components/WorkoutInfoSection"
import { type SavedWorkout } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"

interface WorkoutPreviewScreenProps {
  workout: SavedWorkout
  onClose: () => void
}

export const WorkoutPreviewScreen: FC<WorkoutPreviewScreenProps> = function WorkoutPreviewScreen({
  workout,
  onClose,
}) {
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
      style={$container}
      preset="scroll"
      safeAreaEdges={["top"]}
      contentContainerStyle={$contentContainer}
    >
      <WorkoutHeader title={workout.name} onClose={onClose} />

      <View style={$workoutDetails}>
        <WorkoutTypeSection workoutType={workoutPlan.type} />
        <WorkoutDetailsSection workoutType={workoutPlan.type} workout={workoutPlan.workout} />
        <WorkoutInfoSection
          activity={workout.activity}
          location={workout.location as "indoor" | "outdoor"}
          createdAt={workout.createdAt}
        />
      </View>
    </Screen>
  )
}

// Styles
const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $contentContainer: ViewStyle = {
  paddingBottom: 24,
}

const $workoutDetails: ViewStyle = {
  paddingHorizontal: 24,
  paddingVertical: 24,
}
