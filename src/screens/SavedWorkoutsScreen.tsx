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
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

// LoadingState Component
const LoadingState: FC = () => {
  const { themed } = useAppTheme()
  return (
    <View style={themed($loadingContainer)}>
      <View style={themed($header)}>
        <Text preset="heading">Saved Workouts</Text>
        <Text preset="subheading">Your saved workout plans</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themed($scrollContent)}
      >
        {[1, 2, 3].map((i) => (
          <View key={i} style={themed($skeletonCard)}>
            <View style={themed($skeletonContent)}>
              <View style={themed($skeletonTitle)} />
              <View style={themed($skeletonDescription)} />
              <View style={themed($skeletonMeta)} />
            </View>
            <View style={themed($skeletonButton)} />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

// EmptyState Component
const EmptyState: FC = () => {
  const { themed } = useAppTheme()
  return (
    <View style={themed($emptyState)}>
      <View style={themed($emptyIconContainer)}>
        <HeartIcon size={40} color={themed($emptyIconColor)} />
      </View>
      <Text preset="heading" size="md" style={themed($emptyTitle)}>
        No Saved Workouts
      </Text>
      <Text preset="formHelper" style={themed($emptyDescription)}>
        Create your first workout to see it here
      </Text>
    </View>
  )
}

// WorkoutCard Component
interface WorkoutCardProps {
  workout: SavedWorkout
  onPreview: (workout: SavedWorkout) => void
  onDelete: (id: string) => void
  onButtonPress: (message: string) => void
}

const WorkoutCard: FC<WorkoutCardProps> = ({ workout, onPreview, onDelete, onButtonPress }) => {
  const { themed, theme } = useAppTheme()
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
      <View style={themed($workoutCard)}>
        {/* Workout Info */}
        <View style={themed($workoutInfo)}>
          <Text preset="heading" size="sm" style={themed($workoutName)}>
            {workout.name}
          </Text>
          <Text preset="formHelper" size="xs" style={themed($workoutDescription)}>
            {getWorkoutSummary(workout.workoutPlan)}
          </Text>
          <View style={themed($workoutMeta)}>
            <View style={themed($metaItem)}>
              {workout.location === "indoor" ? (
                <HomeIcon size={12} color={themed($indoorIconColor)} />
              ) : (
                <SunIcon size={12} color={themed($outdoorIconColor)} />
              )}
              <Text preset="formHelper" size="xxs" style={themed($metaText)}>
                {workout.location === "indoor" ? "Indoor" : "Outdoor"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={themed($actionButtons)}>
          <Button
            preset="default"
            onPress={() => onPreview(workout)}
            style={themed($iconButton)}
            textStyle={themed($iconButtonText)}
          >
            <EyeIcon size={18} color={themed($eyeIconColor)} />
          </Button>
          <Button
            preset="default"
            onPress={() => onDelete(workout.id)}
            style={themed($deleteIconButton)}
            textStyle={themed($iconButtonText)}
          >
            <TrashIcon size={18} color={themed($trashIconColor)} />
          </Button>
        </View>
      </View>

      {/* Workout Preview */}
      <View style={themed($workoutPreview)}>
        <PreviewWorkoutButton
          workoutPlan={workout.workoutPlan}
          onButtonPress={({ nativeEvent }) => onButtonPress(nativeEvent.message)}
          label="Start Workout"
          buttonColor={theme.colors.tint}
          textColor={theme.colors.palette.neutral100}
          cornerRadius={12}
          fontSize={16}
          style={themed($startWorkoutButton)}
        />
      </View>
    </View>
  )
}

export const SavedWorkoutsScreen: FC = function SavedWorkoutsScreen() {
  const { themed } = useAppTheme()
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
      <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["top"]}>
        <LoadingState />
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["top"]}>
      <View style={themed($header)}>
        <Text preset="heading">Saved Workouts</Text>
        <Text preset="subheading">Your saved workout plans</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themed($scrollContent)}
      >
        {savedWorkouts.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={themed($workoutsList)}>
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

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
})

const $workoutsList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.lg,
  gap: spacing.md,
})

const $workoutCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
})

const $workoutInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing.md,
  paddingTop: 2,
})

const $workoutName: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  marginBottom: 6,
  fontWeight: "600",
})

const $workoutDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.sm,
  lineHeight: 18,
})

const $workoutMeta: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
  alignItems: "center",
})

const $metaItem: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
})

const $metaText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $actionButtons: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  alignItems: "flex-start",
  paddingTop: 2,
})

const $iconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
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
})

const $deleteIconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
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
})

const $iconButtonText: TextStyle = {
  fontSize: 0, // Hide text, only show icon
}

const $startWorkoutButton: ThemedStyle<ViewStyle> = () => ({
  height: 56,
  borderRadius: 12,
})

const $workoutPreview: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  paddingHorizontal: 4,
})

// Loading States
const $skeletonCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: spacing.md,
})

const $skeletonContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing.sm,
})

const $skeletonTitle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 16,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  marginBottom: spacing.xs,
  width: "60%",
})

const $skeletonDescription: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 12,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  marginBottom: spacing.xs,
  width: "80%",
})

const $skeletonMeta: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 10,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  width: "40%",
})

const $skeletonButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 32,
  width: 32,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
})

// Empty State
const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: 80,
  paddingHorizontal: spacing.xl,
})

const $emptyIconContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: spacing.lg,
})

const $emptyTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xs,
  textAlign: "center",
})

const $emptyDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 20,
})

// Color helpers
const $emptyIconColor: ThemedStyle<string> = ({ colors }) => colors.palette.neutral400
const $indoorIconColor: ThemedStyle<string> = ({ colors }) => colors.palette.secondary500
const $outdoorIconColor: ThemedStyle<string> = ({ colors }) => colors.palette.accent500
const $eyeIconColor: ThemedStyle<string> = ({ colors }) => colors.tint
const $trashIconColor: ThemedStyle<string> = ({ colors }) => colors.palette.angry500
