import { FC, useState, useCallback } from "react"
import { View, ViewStyle, ScrollView, Alert } from "react-native"
import type { TextStyle } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { PreviewWorkoutButton } from "expo-workoutkit"
import { format } from "date-fns"
import {
  TrashIcon,
  EyeIcon,
  SunIcon,
  HomeIcon,
  SparklesIcon,
  CalendarIcon,
} from "react-native-heroicons/outline"

import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { getActivityEmoji } from "@/utils/workoutUtils"

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

// WorkoutCard Component
interface WorkoutCardProps {
  workout: SavedWorkout
  onPreview: (workout: SavedWorkout) => void
  onDelete: (id: string) => void
  onButtonPress: (message: string) => void
}

const WorkoutCard: FC<WorkoutCardProps> = ({ workout, onPreview, onDelete, onButtonPress }) => {
  const { themed, theme } = useAppTheme()
  const activityEmoji = getActivityEmoji(workout.activity)
  const getPlanBadge = (
    workoutPlan: unknown,
  ): { label: string; variant: "primary" | "secondary" | "accent" | "neutral" } | null => {
    if (!workoutPlan || typeof workoutPlan !== "object") return null
    const plan = workoutPlan as Record<string, unknown>
    const t = plan.type as string | undefined
    switch (t) {
      case "goal":
        return { label: "Simple", variant: "accent" }
      case "pacer":
        return { label: "Pacer", variant: "secondary" }
      case "custom":
        return { label: "Custom", variant: "primary" }
      default:
        return null
    }
  }

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
    <View style={themed($workoutCard)}>
      <View style={themed($cardTopRow)}>
        {/* Workout Info */}
        <View style={themed($workoutInfo)}>
          <View style={themed($titleRow)}>
            <Text preset="heading" size="sm" style={themed($workoutName)}>
              {workout.name}
            </Text>
            {workout.origin === "ai" ? (
              <SparklesIcon size={14} color={theme.colors.palette.accent500} />
            ) : null}
          </View>
          <Text preset="formHelper" size="xs" style={themed($workoutDescription)}>
            {getWorkoutSummary(workout.workoutPlan)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={themed($actionButtons)}>
          <Button
            preset="default"
            onPress={() => onPreview(workout)}
            style={themed($iconButton)}
            textStyle={themed($iconButtonText)}
          >
            <EyeIcon size={18} color={theme.colors.tint} />
          </Button>
          <Button
            preset="default"
            onPress={() => onDelete(workout.id)}
            style={themed($deleteIconButton)}
            textStyle={themed($iconButtonText)}
          >
            <TrashIcon size={18} color={theme.colors.error} />
          </Button>
        </View>
      </View>

      <View style={themed($workoutMeta)}>
        <Badge label={activityEmoji} size="sm" variant="neutral" />
        {(() => {
          const plan = getPlanBadge(workout.workoutPlan)
          if (!plan) return null
          return <Badge label={plan.label} size="sm" variant={plan.variant} />
        })()}

        <View style={themed($metaItem)}>
          {workout.location === "indoor" ? (
            <HomeIcon size={12} color={theme.colors.palette.secondary500} />
          ) : (
            <SunIcon size={12} color={theme.colors.palette.accent500} />
          )}
          <Text preset="formHelper" size="xxs">
            {workout.location === "indoor" ? "Indoor" : "Outdoor"}
          </Text>
        </View>

        {/* Date Badge - Only show if scheduled */}
        {workout.scheduledDate && (
          <View style={themed($dateBadge)}>
            <CalendarIcon size={12} color={theme.colors.textDim} />
            <Text preset="formHelper" size="xxs" style={themed($dateText)}>
              {format(workout.scheduledDate, "MMM d")}
            </Text>
          </View>
        )}
      </View>

      {/* Footer Button inside card */}
      <View style={themed($cardFooter)}>
        <PreviewWorkoutButton
          workoutPlan={workout.workoutPlan}
          onButtonPress={({ nativeEvent }) => onButtonPress(nativeEvent.message)}
          label="Send workout to ⌚"
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

type FilterType = "all" | "upcoming" | "completed"

export const SavedWorkoutsScreen: FC = function SavedWorkoutsScreen() {
  const { themed } = useAppTheme()
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")

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

  const getFilteredWorkouts = (): SavedWorkout[] => {
    switch (filter) {
      case "upcoming":
        return savedWorkouts.filter(
          (w) => w.scheduledDate && w.scheduledDate >= new Date() && w.status === "scheduled",
        )
      case "completed":
        return savedWorkouts.filter((w) => w.status === "completed")
      default:
        return savedWorkouts
    }
  }

  const filteredWorkouts = getFilteredWorkouts()

  const handleButtonPress = () => {}

  const handlePreviewWorkout = (workout: SavedWorkout) => {
    // Navigate to workout details screen
    router.push({
      pathname: "/(tabs)/saved/[id]",
      params: { id: workout.id },
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

      {/* Filter Buttons */}
      <View style={themed($filterContainer)}>
        <Button preset={filter === "all" ? "filled" : "default"} onPress={() => setFilter("all")}>
          All ({savedWorkouts.length})
        </Button>
        <Button
          preset={filter === "upcoming" ? "filled" : "default"}
          onPress={() => setFilter("upcoming")}
        >
          Upcoming (
          {savedWorkouts.filter((w) => w.scheduledDate && w.status === "scheduled").length})
        </Button>
        <Button
          preset={filter === "completed" ? "filled" : "default"}
          onPress={() => setFilter("completed")}
        >
          Completed ({savedWorkouts.filter((w) => w.status === "completed").length})
        </Button>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themed($scrollContent)}
      >
        {filteredWorkouts.length === 0 ? (
          <View style={themed($emptyState)}>
            <Text preset="formHelper" style={themed($emptyDescription)}>
              {filter === "upcoming"
                ? "No upcoming workouts scheduled"
                : filter === "completed"
                  ? "No completed workouts yet"
                  : "No saved workouts"}
            </Text>
          </View>
        ) : (
          <View style={themed($workoutsList)}>
            {filteredWorkouts.map((savedWorkout) => (
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
  paddingHorizontal: spacing.lg,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  marginBottom: spacing.md,
})

const $filterContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
  paddingHorizontal: spacing.lg,
  marginBottom: spacing.md,
})

const $workoutsList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.lg,
  gap: spacing.md,
})

const $workoutCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "flex-start",
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

const $cardTopRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: spacing.md,
})

const $workoutInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing.md,
  paddingTop: 2,
})

const $titleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
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
  gap: spacing.sm,
  alignItems: "center",
  flexWrap: "wrap",
  flex: 1,
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
  width: "100%",
  marginHorizontal: 0,
})

const $cardFooter: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  paddingTop: spacing.sm,
  borderTopWidth: 1,
  borderTopColor: colors.border,
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

const $emptyDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 20,
})

const $metaItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxxs,
})

const $dateBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxxs,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxs,
  borderWidth: 1,
  borderColor: colors.border,
})

const $dateText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontWeight: "500",
})
