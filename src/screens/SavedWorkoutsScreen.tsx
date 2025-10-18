import { FC, useState, useCallback } from "react"
import { View, ViewStyle, ScrollView, Alert } from "react-native"
import type { TextStyle } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { PreviewWorkoutButton } from "expo-workoutkit"
import { TrashIcon, HeartIcon, HomeIcon, SunIcon, EyeIcon } from "react-native-heroicons/outline"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"

// LoadingState Component
const LoadingState: FC = () => (
  <View style={$loadingContainer}>
    <View style={$header}>
      <Text preset="heading">Saved Workouts</Text>
      <Text preset="subheading">Your saved workout plans</Text>
    </View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={$skeletonCard}>
          <View style={$skeletonContent}>
            <View style={$skeletonTitle} />
            <View style={$skeletonDescription} />
            <View style={$skeletonMeta} />
          </View>
          <View style={$skeletonButton} />
        </View>
      ))}
    </ScrollView>
  </View>
)

// EmptyState Component
const EmptyState: FC = () => (
  <View style={$emptyState}>
    <View style={$emptyIconContainer}>
      <HeartIcon size={40} color={colors.palette.neutral400} />
    </View>
    <Text preset="heading" size="md" style={$emptyTitle}>
      No Saved Workouts
    </Text>
    <Text preset="formHelper" style={$emptyDescription}>
      Create your first workout to see it here
    </Text>
  </View>
)

// WorkoutCard Component
interface WorkoutCardProps {
  workout: SavedWorkout
  onPreview: (workout: SavedWorkout) => void
  onDelete: (id: string) => void
  onButtonPress: (message: string) => void
}

const WorkoutCard: FC<WorkoutCardProps> = ({ workout, onPreview, onDelete, onButtonPress }) => {
  const getWorkoutSummary = (workoutPlan: unknown): string => {
    if (!workoutPlan || typeof workoutPlan !== "object") {
      return "Workout Plan"
    }

    const plan = workoutPlan as Record<string, unknown>
    if (!plan.type) {
      return "Workout Plan"
    }

    switch (plan.type) {
      case "goal": {
        const workout = plan.workout as Record<string, unknown> | undefined
        const goal = workout?.goal as Record<string, unknown> | undefined
        if (goal?.type === "time" && goal.value) {
          return `Goal: ${goal.value} ${goal.unit || "min"}`
        } else if (goal?.type === "distance" && goal.value) {
          return `Goal: ${goal.value} ${goal.unit || "km"}`
        } else {
          return "Open Goal Workout"
        }
      }
      case "pacer": {
        const workout = plan.workout as Record<string, unknown> | undefined
        const distance = workout?.distance as Record<string, unknown> | undefined
        const time = workout?.time as Record<string, unknown> | undefined
        if (distance?.value && time?.value) {
          return `${distance.value}km in ${time.value}min`
        }
        return "Pacer Workout"
      }
      case "custom": {
        const workout = plan.workout as Record<string, unknown> | undefined
        const blocks = workout?.blocks as unknown[] | undefined
        const blockCount = blocks?.length || 0
        return `Custom: ${blockCount} interval${blockCount !== 1 ? "s" : ""}`
      }
      default:
        return "Workout Plan"
    }
  }

  return (
    <View>
      <View style={$workoutCard}>
        {/* Workout Info */}
        <View style={$workoutInfo}>
          <Text preset="heading" size="sm" style={$workoutName}>
            {workout.name}
          </Text>
          <Text preset="formHelper" size="xs" style={$workoutDescription}>
            {getWorkoutSummary(workout.workoutPlan)}
          </Text>
          <View style={$workoutMeta}>
            <View style={$metaItem}>
              {workout.location === "indoor" ? (
                <HomeIcon size={12} color={colors.palette.secondary500} />
              ) : (
                <SunIcon size={12} color={colors.palette.accent500} />
              )}
              <Text preset="formHelper" size="xxs" style={$metaText}>
                {workout.location === "indoor" ? "Indoor" : "Outdoor"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={$actionButtons}>
          <Button
            preset="default"
            onPress={() => onPreview(workout)}
            style={$iconButton}
            textStyle={$iconButtonText}
          >
            <EyeIcon size={18} color={colors.tint} />
          </Button>
          <Button
            preset="default"
            onPress={() => onDelete(workout.id)}
            style={$deleteIconButton}
            textStyle={$iconButtonText}
          >
            <TrashIcon size={18} color={colors.palette.angry500} />
          </Button>
        </View>
      </View>

      {/* Workout Preview */}
      <View style={$workoutPreview}>
        <PreviewWorkoutButton
          workoutPlan={workout.workoutPlan}
          onButtonPress={({ nativeEvent }) => onButtonPress(nativeEvent.message)}
          label="Start Workout"
          buttonColor={colors.tint}
          textColor={colors.palette.neutral100}
          cornerRadius={12}
          fontSize={16}
          style={$startWorkoutButton}
        />
      </View>
    </View>
  )
}

export const SavedWorkoutsScreen: FC = function SavedWorkoutsScreen() {
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      loadWorkouts()
    }, []),
  )

  const loadWorkouts = async () => {
    try {
      const workouts = await WorkoutStorage.getWorkouts()
      setSavedWorkouts(workouts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    } catch (error) {
      console.error("Error loading workouts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleButtonPress = (message: string) => {
    Alert.alert("Workout Button Pressed", message)
  }

  const handlePreviewWorkout = (workout: SavedWorkout) => {
    // Navigate to workout preview screen as modal
    router.push({
      pathname: "/(tabs)/saved/preview",
      params: { workoutId: workout.id },
    })
  }

  const handleDeleteWorkout = async (id: string) => {
    Alert.alert("Delete Workout", "Are you sure you want to delete this workout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await WorkoutStorage.deleteWorkout(id)
            setSavedWorkouts((prev) => prev.filter((workout) => workout.id !== id))
          } catch (error) {
            console.error("Error deleting workout:", error)
            Alert.alert("Error", "Failed to delete workout")
          }
        },
      },
    ])
  }

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
        <LoadingState />
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <View style={$header}>
        <Text preset="heading">Saved Workouts</Text>
        <Text preset="subheading">Your saved workout plans</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        {savedWorkouts.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={$workoutsList}>
            {savedWorkouts.map((savedWorkout) => (
              <WorkoutCard
                key={savedWorkout.id}
                workout={savedWorkout}
                onPreview={handlePreviewWorkout}
                onDelete={handleDeleteWorkout}
                onButtonPress={handleButtonPress}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

// Modern Styles
const $container: ViewStyle = {
  flex: 1,
}

const $loadingContainer: ViewStyle = {
  flex: 1,
}

const $scrollContent: ViewStyle = {
  paddingVertical: 40,
  paddingHorizontal: 24,
}

const $header: ViewStyle = {
  paddingHorizontal: 24,
}

const $workoutsList: ViewStyle = {
  paddingVertical: 20,
  gap: 16,
}

const $workoutCard: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  backgroundColor: colors.palette.neutral100,
  padding: 20,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
}

const $workoutInfo: ViewStyle = {
  flex: 1,
  marginRight: 16,
  paddingTop: 2,
}

const $workoutName: TextStyle = {
  color: colors.text,
  marginBottom: 6,
  fontWeight: "600",
}

const $workoutDescription: TextStyle = {
  color: colors.textDim,
  marginBottom: 12,
  lineHeight: 18,
}

const $workoutMeta: ViewStyle = {
  flexDirection: "row",
  gap: 16,
  alignItems: "center",
}

const $metaItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
}

const $metaText: TextStyle = {
  color: colors.textDim,
}

const $actionButtons: ViewStyle = {
  flexDirection: "row",
  gap: 12,
  alignItems: "flex-start",
  paddingTop: 2,
}

const $iconButton: ViewStyle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  padding: 0,
  minHeight: 44,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
}

const $deleteIconButton: ViewStyle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  padding: 0,
  minHeight: 44,
  backgroundColor: colors.palette.angry100,
  borderWidth: 1,
  borderColor: colors.palette.angry500,
  shadowColor: colors.palette.angry500,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 1,
}

const $iconButtonText: TextStyle = {
  fontSize: 0, // Hide text, only show icon
}

const $startWorkoutButton: ViewStyle = {
  height: 56,
  borderRadius: 12,
}

const $workoutPreview: ViewStyle = {
  marginTop: 16,
  paddingHorizontal: 4,
}

// Loading States
const $skeletonCard: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.palette.neutral100,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 16,
}

const $skeletonContent: ViewStyle = {
  flex: 1,
  marginRight: 12,
}

const $skeletonTitle: ViewStyle = {
  height: 16,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  marginBottom: 8,
  width: "60%",
}

const $skeletonDescription: ViewStyle = {
  height: 12,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  marginBottom: 8,
  width: "80%",
}

const $skeletonMeta: ViewStyle = {
  height: 10,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  width: "40%",
}

const $skeletonButton: ViewStyle = {
  height: 32,
  width: 32,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
}

// Empty State
const $emptyState: ViewStyle = {
  alignItems: "center",
  paddingVertical: 80,
  paddingHorizontal: 40,
}

const $emptyIconContainer: ViewStyle = {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 24,
}

const $emptyTitle: TextStyle = {
  color: colors.text,
  marginBottom: 8,
  textAlign: "center",
}

const $emptyDescription: TextStyle = {
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 20,
}
