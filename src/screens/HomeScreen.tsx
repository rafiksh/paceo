import { FC, useState, useCallback } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native"
import { router, useFocusEffect } from "expo-router"
import { format, startOfWeek, addDays, addWeeks, isSameDay, isToday } from "date-fns"
import {
  PlusIcon,
  CalendarIcon,
  FireIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
} from "react-native-heroicons/outline"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"
import { useAppTheme } from "@/theme/context"
import { radius } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"
import { getActivityEmoji } from "@/utils/workoutUtils"

export const HomeScreen: FC = function HomeScreen() {
  const { themed, theme, themeContext, setThemeContextOverride } = useAppTheme()
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<SavedWorkout[]>([])
  const [stats, setStats] = useState({
    totalCompleted: 0,
    thisWeekCompleted: 0,
    thisMonthCompleted: 0,
  })
  const [refreshing, setRefreshing] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week, -1 = last week, 1 = next week

  const loadData = useCallback(async () => {
    try {
      const [upcoming, workoutStats] = await Promise.all([
        WorkoutStorage.getUpcomingWorkouts(),
        WorkoutStorage.getWorkoutStats(),
      ])
      setUpcomingWorkouts(upcoming.slice(0, 5)) // Show next 5 workouts
      setStats(workoutStats)
    } catch (error) {
      console.error("Error loading home data:", error)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData]),
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleCreateWorkout = () => {
    router.push("/(tabs)/home/create")
  }

  const handleWorkoutPress = (workout: SavedWorkout) => {
    router.push({
      pathname: "/(tabs)/home/workout/[id]",
      params: { id: workout.id },
    })
  }

  const handleDayPress = (day: Date) => {
    router.push({
      pathname: "/(tabs)/home/day/[date]",
      params: { date: day.toISOString() },
    })
  }

  const handlePreviousWeek = () => {
    setWeekOffset((prev) => prev - 1)
  }

  const handleNextWeek = () => {
    setWeekOffset((prev) => prev + 1)
  }

  const handleThisWeek = () => {
    setWeekOffset(0)
  }

  const getWeekDays = () => {
    const today = new Date()
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday start
    const targetWeekStart = addWeeks(currentWeekStart, weekOffset)
    return Array.from({ length: 7 }, (_, i) => addDays(targetWeekStart, i))
  }

  const getWorkoutsForDay = (day: Date) => {
    return upcomingWorkouts.filter((w) => w.scheduledDate && isSameDay(w.scheduledDate, day))
  }

  const weekDays = getWeekDays()

  const toggleTheme = () => {
    setThemeContextOverride(themeContext === "dark" ? "light" : "dark")
  }
  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["top"]}>
      <View style={$header}>
        <Text preset="heading">Hola peceo!</Text>
        <Button preset="ghost" onPress={toggleTheme}>
          {themeContext === "dark" ? (
            <SunIcon size={20} color={theme.colors.text} />
          ) : (
            <MoonIcon size={20} color={theme.colors.text} />
          )}
        </Button>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Cards */}
        <View style={themed($statsContainer)}>
          <View style={themed($statCard)}>
            <FireIcon size={24} color={theme.colors.tint} />
            <Text preset="bold" size="xl">
              {stats.totalCompleted}
            </Text>
            <Text preset="formHelper">Total Completed</Text>
          </View>
          <View style={themed($statCard)}>
            <CalendarIcon size={24} color={theme.colors.tint} />
            <Text preset="bold" size="xl">
              {stats.thisWeekCompleted}
            </Text>
            <Text preset="formHelper">This Week</Text>
          </View>
        </View>

        {/* Create Workout Button */}
        <Button
          preset="default"
          style={themed($createButton)}
          onPress={handleCreateWorkout}
          LeftAccessory={() => <PlusIcon size={20} color={theme.colors.palette.neutral100} />}
        >
          Create Workout
        </Button>

        {/* Weekly Agenda */}
        <View style={$section}>
          <View style={$weekHeader}>
            <TouchableOpacity onPress={handlePreviousWeek} style={$weekNavButton}>
              <ChevronLeftIcon size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleThisWeek}>
              <Text preset="subheading">
                {weekOffset === 0
                  ? "This Week"
                  : `${format(weekDays[0], "MMM d")} - ${format(weekDays[6], "MMM d")}`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextWeek} style={$weekNavButton}>
              <ChevronRightIcon size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={themed($weekContainer)}>
            {weekDays.map((day) => {
              const dayWorkouts = getWorkoutsForDay(day)
              const isCurrentDay = isToday(day)

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={themed($dayColumn)}
                  onPress={() => handleDayPress(day)}
                >
                  <View style={[themed($dayHeader), isCurrentDay && themed($todayHeader)]}>
                    <Text preset="formHelper" size="xxs" style={isCurrentDay && themed($todayText)}>
                      {format(day, "EEE")}
                    </Text>
                    <Text preset="bold" size="md" style={isCurrentDay && themed($todayText)}>
                      {format(day, "d")}
                    </Text>
                  </View>
                  <View style={themed($dayWorkouts)}>
                    {dayWorkouts.length > 0 ? (
                      dayWorkouts.map((workout) => (
                        <TouchableOpacity
                          key={workout.id}
                          style={themed($workoutDot)}
                          onPress={(e) => {
                            e.stopPropagation()
                            handleWorkoutPress(workout)
                          }}
                        >
                          <Text style={$workoutEmoji}>{getActivityEmoji(workout.activity)}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={$emptyDay} />
                    )}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Upcoming Workouts List */}
        <View style={$section}>
          <Text preset="subheading" style={$sectionTitle}>
            Upcoming Workouts
          </Text>
          {upcomingWorkouts.length > 0 ? (
            upcomingWorkouts.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={themed($workoutCard)}
                onPress={() => handleWorkoutPress(workout)}
              >
                <View style={$workoutCardHeader}>
                  <Text style={$workoutEmoji}>{getActivityEmoji(workout.activity)}</Text>
                  <View style={$workoutCardInfo}>
                    <Text preset="bold">{workout.name}</Text>
                    <Text preset="formHelper">
                      {workout.scheduledDate
                        ? format(workout.scheduledDate, "EEE, MMM d 'at' h:mm a")
                        : "Not scheduled"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={themed($emptyState)}>
              <Text preset="formHelper">No upcoming workouts scheduled</Text>
              <Text preset="formHelper" style={$emptyStateHint}>
                Create a workout and set a date to get started!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $header: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingBottom: 16,
}

const $statsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  paddingHorizontal: spacing.lg,
  gap: spacing.md,
  marginBottom: spacing.lg,
})

const $statCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral100,
  borderRadius: radius.md,
  padding: spacing.md,
  alignItems: "center",
  gap: spacing.xs,
})

const $createButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.lg,
  marginBottom: spacing.lg,
})

const $section: ViewStyle = {
  paddingHorizontal: 20,
  marginBottom: 24,
}

const $sectionTitle: TextStyle = {
  marginBottom: 12,
}

const $weekHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
  paddingHorizontal: 8,
}

const $weekNavButton: ViewStyle = {
  padding: 8,
}

const $weekContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
})

const $dayColumn: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xs,
})

const $dayHeader: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: radius.sm,
  padding: spacing.xs,
  alignItems: "center",
})

const $todayHeader: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
})

const $todayText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $dayWorkouts: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 40,
  gap: spacing.xxs,
  alignItems: "center",
})

const $emptyDay: ViewStyle = {
  height: 8,
}

const $workoutDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 16, // radius.full equivalent
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
  justifyContent: "center",
})

const $workoutEmoji: TextStyle = {
  // Emoji display - using default text size from theme
}

const $workoutCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: radius.md,
  padding: spacing.md,
  marginBottom: spacing.sm,
})

const $workoutCardHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}

const $workoutCardInfo: ViewStyle = {
  flex: 1,
}

const $emptyState: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: radius.md,
  padding: spacing.lg,
  alignItems: "center",
})

const $emptyStateHint: TextStyle = {
  marginTop: 4,
  textAlign: "center",
}
