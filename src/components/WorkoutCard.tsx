import { FC } from "react"
import { View, ViewStyle, TouchableOpacity, Alert, Share } from "react-native"
import type { TextStyle } from "react-native"
import { PreviewWorkoutButton } from "expo-workoutkit"
import type { WorkoutPlan } from "expo-workoutkit"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

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
    <View style={$workoutCard}>
      {/* Workout Header */}
      <View style={$workoutHeader}>
        <View style={$workoutTypeContainer}>
          <View style={[$workoutTypeIcon, { backgroundColor: typeConfig.color }]}>
            <Text style={$workoutTypeIconText}>{typeConfig.icon}</Text>
          </View>
          <View style={$workoutTypeInfo}>
            <Text style={$workoutTypeLabel}>{typeConfig.label}</Text>
            <Text style={$workoutActivityLabel}>
              {activityIcon} {workout.workout.activity}
            </Text>
          </View>
        </View>
        <View style={$workoutLocation}>
          <Text style={$workoutLocationText}>
            {workout.workout.location === "indoor" ? "🏠" : "🌳"} {workout.workout.location}
          </Text>
        </View>
      </View>

      {/* Workout Details */}
      <View style={$workoutDetails}>
        <Text style={$workoutTitle}>{title}</Text>
        <Text style={$workoutSubtitle}>{subtitle}</Text>
      </View>

      {/* Workout Preview */}
      <View style={$workoutPreview}>
        <PreviewWorkoutButton
          workoutPlan={workout}
          onButtonPress={({ nativeEvent: { message } }) => onButtonPress(message)}
          style={$previewButton}
        />
      </View>

      {/* Action Buttons */}
      <View style={$workoutActions}>
        <TouchableOpacity style={$actionButton} onPress={shareWorkout}>
          <Text style={$actionButtonIcon}>📤</Text>
          <Text style={$actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[$actionButton, $deleteButton]} onPress={deleteWorkout}>
          <Text style={$actionButtonIcon}>🗑️</Text>
          <Text style={[$actionButtonText, $deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Styles
const $workoutCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
}

// Workout Header
const $workoutHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
}

const $workoutTypeContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $workoutTypeIcon: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
}

const $workoutTypeIconText: TextStyle = {
  fontSize: 18,
}

const $workoutTypeInfo: ViewStyle = {
  flex: 1,
}

const $workoutTypeLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 2,
}

const $workoutActivityLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "500",
  color: colors.textDim,
  fontFamily: typography.primary.medium,
}

const $workoutLocation: ViewStyle = {
  alignItems: "flex-end",
}

const $workoutLocationText: TextStyle = {
  fontSize: 12,
  fontWeight: "500",
  color: colors.textDim,
  fontFamily: typography.primary.medium,
}

// Workout Details
const $workoutDetails: ViewStyle = {
  marginBottom: 16,
}

const $workoutTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  fontFamily: typography.primary.bold,
  marginBottom: 4,
  lineHeight: 24,
}

const $workoutSubtitle: TextStyle = {
  fontSize: 14,
  fontWeight: "500",
  color: colors.textDim,
  fontFamily: typography.primary.medium,
  lineHeight: 20,
}

// Workout Preview
const $workoutPreview: ViewStyle = {
  marginBottom: 20,
}

const $previewButton: ViewStyle = {
  height: 100,
  width: "100%",
  borderRadius: 12,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
}

// Action Buttons
const $workoutActions: ViewStyle = {
  flexDirection: "row",
  gap: 12,
}

const $actionButton: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
}

const $deleteButton: ViewStyle = {
  backgroundColor: "#FF6B6B",
  borderColor: "#FF6B6B",
}

const $actionButtonIcon: TextStyle = {
  fontSize: 16,
  marginRight: 6,
}

const $actionButtonText: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $deleteButtonText: TextStyle = {
  color: colors.palette.neutral100,
}
