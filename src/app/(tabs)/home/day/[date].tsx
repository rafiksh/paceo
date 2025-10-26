import { useState, useEffect, useCallback } from "react"
import { View, ViewStyle, ScrollView, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { format, isSameDay, parseISO, addDays, subDays } from "date-fns"
import {
  ClockIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "react-native-heroicons/outline"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { getActivityEmoji } from "@/utils/workoutUtils"

export default function DayWorkoutsScreen() {
  const { date } = useLocalSearchParams<{ date: string }>()
  const { themed, theme } = useAppTheme()
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState<Date>(() => (date ? parseISO(date) : new Date()))

  const loadWorkouts = useCallback(async () => {
    try {
      const allWorkouts = await WorkoutStorage.getWorkouts()

      // Filter workouts for the current date
      const dayWorkouts = allWorkouts.filter(
        (workout) => workout.scheduledDate && isSameDay(workout.scheduledDate, currentDate),
      )

      // Sort by scheduled time
      dayWorkouts.sort((a, b) => {
        if (!a.scheduledDate || !b.scheduledDate) return 0
        return a.scheduledDate.getTime() - b.scheduledDate.getTime()
      })

      setWorkouts(dayWorkouts)
    } catch (error) {
      console.error("Error loading day workouts:", error)
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    loadWorkouts()
  }, [loadWorkouts])

  const handleWorkoutPress = (workout: SavedWorkout) => {
    router.push({
      pathname: "/home/workout/[id]",
      params: { id: workout.id },
    })
  }

  const formatTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy")
  }

  const handlePreviousDay = () => {
    const newDate = subDays(currentDate, 1)
    setCurrentDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = addDays(currentDate, 1)
    setCurrentDate(newDate)
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["top"]}>
        <View style={themed($loadingContainer)}>
          <Text preset="heading">Loading...</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["top"]}>
      {/* Header with Navigation */}
      <View style={themed($headerContainer)}>
        <View style={themed($headerTop)}>
          <TouchableOpacity onPress={handleBack} style={themed($backButton)}>
            <ArrowLeftIcon size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text preset="heading" size="lg" style={themed($headerTitle)}>
            Workouts
          </Text>
          <View style={themed($headerSpacer)} />
        </View>

        <View style={themed($dateNavigation)}>
          <TouchableOpacity onPress={handlePreviousDay} style={themed($navButton)}>
            <ChevronLeftIcon size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={themed($dateDisplay)}>
            <Text preset="subheading" style={themed($dateText)}>
              {formatDate(currentDate)}
            </Text>
          </View>

          <TouchableOpacity onPress={handleNextDay} style={themed($navButton)}>
            <ChevronRightIcon size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Workouts List */}
        {workouts.length === 0 ? (
          <View style={themed($emptyState)}>
            <Text preset="formHelper" style={themed($emptyText)}>
              No workouts scheduled for this day
            </Text>
            <Text preset="formHelper" size="xs" style={themed($emptySubtext)}>
              Create a workout and schedule it to see it here
            </Text>
          </View>
        ) : (
          <View style={themed($workoutsList)}>
            {workouts.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={themed($workoutCard)}
                onPress={() => handleWorkoutPress(workout)}
              >
                <View style={themed($workoutCardContent)}>
                  <View style={themed($workoutHeader)}>
                    <Text style={$workoutEmoji}>{getActivityEmoji(workout.activity)}</Text>
                    <View style={themed($workoutInfo)}>
                      <Text preset="bold" size="sm" style={themed($workoutName)}>
                        {workout.name}
                      </Text>
                      <Text preset="formHelper" size="xs" style={themed($workoutDescription)}>
                        {workout.activity} • {workout.location === "indoor" ? "Indoor" : "Outdoor"}
                      </Text>
                    </View>
                  </View>

                  {workout.scheduledDate && (
                    <View style={themed($timeContainer)}>
                      <ClockIcon size={16} color={theme.colors.tint} />
                      <Text preset="formHelper" size="sm" style={themed($timeText)}>
                        {formatTime(workout.scheduledDate)}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})

const $headerContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  paddingBottom: spacing.md,
  marginBottom: spacing.md,
})

const $headerTop: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.md,
})

const $backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.sm,
  borderRadius: 8,
  backgroundColor: "transparent",
})

const $headerTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "600",
})

const $headerSpacer: ViewStyle = {
  width: 40, // Same width as back button for centering
}

const $dateNavigation: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.lg,
  gap: spacing.md,
})

const $navButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.sm,
  borderRadius: 8,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.border,
  minWidth: 40,
  alignItems: "center",
  justifyContent: "center",
})

const $dateDisplay: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  flex: 1,
  justifyContent: "center",
})

const $dateText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "500",
})

const $workoutsList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  gap: spacing.sm,
})

const $workoutCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
})

const $workoutCardContent: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $workoutHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  flex: 1,
})

const $workoutInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xxs,
})

const $workoutName: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $workoutDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $timeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  backgroundColor: "rgba(0, 0, 0, 0.05)",
  borderRadius: 8,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $timeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "600",
})

const $workoutEmoji: TextStyle = {
  fontSize: 24,
}

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.xs,
})

const $emptySubtext: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})
