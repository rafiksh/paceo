import { FC } from "react"
import { View, ViewStyle, TouchableOpacity, Alert, Share } from "react-native"
import type { TextStyle } from "react-native"
import { PreviewWorkoutButton } from "expo-workoutkit"
import type { WorkoutPlan } from "expo-workoutkit"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

const WORKOUT_TYPE_CONFIG = {
  goal: { icon: "🎯", color: "#FF6B6B", label: "Goal" },
  pacer: { icon: "🏃‍♂️", color: "#4ECDC4", label: "Pacer" },
  custom: { icon: "⚡", color: "#45B7D1", label: "Custom" },
}

const ACTIVITY_ICONS = {
  running: "🏃‍♂️",
  cycling: "🚴‍♂️",
  swimming: "🏊‍♂️",
  walking: "🚶‍♂️",
  strengthTraining: "🏋️‍♂️",
  yoga: "🧘‍♀️",
  tennis: "🎾",
  basketball: "🏀",
  soccer: "⚽",
  boxing: "🥊",
}

interface WorkoutCardProps {
  workout: WorkoutPlan
  index: number
  onDelete: (index: number) => void
  onButtonPress: (message: string) => void
}

export const WorkoutCard: FC<WorkoutCardProps> = ({ workout, index, onDelete, onButtonPress }) => {
  const { themed } = useAppTheme()
  const typeConfig = WORKOUT_TYPE_CONFIG[workout.type]
  const activityIcon =
    ACTIVITY_ICONS[workout.workout.activity as keyof typeof ACTIVITY_ICONS] || "🏃‍♂️"

  let title = ""
  let subtitle = ""

  switch (workout.type) {
    case "goal":
      if (
        workout.workout.goal.type === "time" &&
        "value" in workout.workout.goal &&
        "unit" in workout.workout.goal
      ) {
        title = `${workout.workout.activity} - ${workout.workout.goal.value} ${workout.workout.goal.unit}`
        subtitle = `Goal: ${workout.workout.goal.value} ${workout.workout.goal.unit}`
      } else {
        title = `${workout.workout.activity} - Open Goal`
        subtitle = `Goal: Open workout`
      }
      break
    case "pacer":
      title = `${workout.workout.activity} - ${workout.workout.distance.value}km in ${workout.workout.time.value}min`
      subtitle = `Pace: ${workout.workout.distance.value}km in ${workout.workout.time.value}min`
      break
    case "custom":
      title = workout.workout.displayName || "Custom Workout"
      subtitle = `Intervals: ${workout.workout.blocks?.[0]?.iterations || 0} rounds`
      break
    default:
      title = "Unknown Workout"
      subtitle = "Workout plan"
  }

  const shareWorkout = async () => {
    try {
      const workoutJson = JSON.stringify(workout, null, 2)
      await Share.share({
        message: `Check out this workout plan:\n\n${workoutJson}`,
        title: "Workout Plan",
      })
    } catch {
      Alert.alert("Error", "Failed to share workout")
    }
  }

  const deleteWorkout = () => {
    Alert.alert("Delete Workout", "Are you sure you want to delete this workout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(index),
      },
    ])
  }

  return (
    <View style={themed($workoutCard)}>
      {/* Workout Header */}
      <View style={themed($workoutHeader)}>
        <View style={themed($workoutTypeContainer)}>
          <View style={[themed($workoutTypeIcon), { backgroundColor: typeConfig.color }]}>
            <Text style={themed($workoutTypeIconText)}>{typeConfig.icon}</Text>
          </View>
          <View style={themed($workoutTypeInfo)}>
            <Text style={themed($workoutTypeLabel)}>{typeConfig.label}</Text>
            <Text style={themed($workoutActivityLabel)}>
              {activityIcon} {workout.workout.activity}
            </Text>
          </View>
        </View>
        <View style={themed($workoutLocation)}>
          <Text style={themed($workoutLocationText)}>
            {workout.workout.location === "indoor" ? "🏠" : "🌳"} {workout.workout.location}
          </Text>
        </View>
      </View>

      {/* Workout Details */}
      <View style={themed($workoutDetails)}>
        <Text style={themed($workoutTitle)}>{title}</Text>
        <Text style={themed($workoutSubtitle)}>{subtitle}</Text>
      </View>

      {/* Workout Preview */}
      <View style={themed($workoutPreview)}>
        <PreviewWorkoutButton
          workoutPlan={workout}
          onButtonPress={({ nativeEvent: { message } }) => onButtonPress(message)}
          style={themed($previewButton)}
        />
      </View>

      {/* Action Buttons */}
      <View style={themed($workoutActions)}>
        <TouchableOpacity style={themed($actionButton)} onPress={shareWorkout}>
          <Text style={themed($actionButtonIcon)}>📤</Text>
          <Text style={themed($actionButtonText)}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[themed($actionButton), themed($deleteButton)]}
          onPress={deleteWorkout}
        >
          <Text style={themed($actionButtonIcon)}>🗑️</Text>
          <Text style={[themed($actionButtonText), themed($deleteButtonText)]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Styles
const $workoutCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 20,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
})

// Workout Header
const $workoutHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: spacing.md,
})

const $workoutTypeContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
})

const $workoutTypeIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.sm,
})

const $workoutTypeIconText: ThemedStyle<TextStyle> = () => ({
  fontSize: 18,
})

const $workoutTypeInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $workoutTypeLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 2,
})

const $workoutActivityLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontWeight: "500",
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

const $workoutLocation: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
})

const $workoutLocationText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontWeight: "500",
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

// Workout Details
const $workoutDetails: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $workoutTitle: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  fontFamily: typography.primary.bold,
  marginBottom: 4,
  lineHeight: 24,
})

const $workoutSubtitle: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontWeight: "500",
  color: colors.textDim,
  fontFamily: typography.primary.medium,
  lineHeight: 20,
})

// Workout Preview
const $workoutPreview: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $previewButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 100,
  width: "100%",
  borderRadius: 12,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
})

// Action Buttons
const $workoutActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $actionButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
})

const $deleteButton: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#FF6B6B",
  borderColor: "#FF6B6B",
})

const $actionButtonIcon: ThemedStyle<TextStyle> = () => ({
  fontSize: 16,
  marginRight: 6,
})

const $actionButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
})

const $deleteButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})
