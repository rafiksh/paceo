import { FC, useState } from "react"
import { ScrollView, ViewStyle, View, Alert, Platform } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { CalendarIcon, CheckCircleIcon, TrashIcon } from "react-native-heroicons/outline"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutDetailsSection } from "@/components/WorkoutDetailsSection"
import { WorkoutHeader } from "@/components/WorkoutHeader"
import { WorkoutInfoSection } from "@/components/WorkoutInfoSection"
import { type SavedWorkout } from "@/services/WorkoutStorage"
import { useAppTheme } from "@/theme/context"
import { radius } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"

interface WorkoutPreviewScreenProps {
  workout: SavedWorkout
  onClose: () => void
  onEditDate?: (date: Date | undefined) => void
  onMarkComplete?: () => void
  onDelete?: () => void
}

export const WorkoutPreviewScreen: FC<WorkoutPreviewScreenProps> = function WorkoutPreviewScreen({
  workout,
  onClose,
  onEditDate,
  onMarkComplete,
  onDelete,
}) {
  const { themed, theme } = useAppTheme()
  const { workoutPlan } = workout
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
    }
    if (date && onEditDate) {
      onEditDate(date)
    }
  }

  const handleClearDate = () => {
    if (onEditDate) {
      Alert.alert("Clear Schedule", "Remove the scheduled date for this workout?", [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", onPress: () => onEditDate(undefined) },
      ])
    }
  }

  const handleDeletePress = () => {
    if (onDelete) {
      Alert.alert("Delete Workout", "Are you sure you want to delete this workout?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ])
    }
  }

  const isCompleted = workout.status === "completed"

  return (
    <Screen
      style={themed($container)}
      preset="fixed"
      contentContainerStyle={themed($contentContainer)}
    >
      <WorkoutHeader title={workout.name} workoutType={workoutPlan.type} onClose={onClose} />

      <ScrollView contentContainerStyle={themed($workoutDetails)}>
        {/* Status and Date Info */}
        {(workout.scheduledDate || isCompleted) && (
          <View style={themed($statusSection)}>
            {isCompleted && workout.completedDate && (
              <View style={themed($statusBadge)}>
                <CheckCircleIcon size={16} color={theme.colors.palette.accent500} />
                <Text preset="formHelper">
                  Completed on {format(workout.completedDate, "MMM d, yyyy")}
                </Text>
              </View>
            )}
            {workout.scheduledDate && !isCompleted && (
              <View style={themed($statusBadge)}>
                <CalendarIcon size={16} color={theme.colors.tint} />
                <Text preset="formHelper">
                  Scheduled for {format(workout.scheduledDate, "EEE, MMM d 'at' h:mm a")}
                </Text>
              </View>
            )}
          </View>
        )}

        <WorkoutDetailsSection workoutType={workoutPlan.type} workout={workoutPlan.workout} />
        <WorkoutInfoSection
          activity={workout.activity}
          location={workout.location as "indoor" | "outdoor"}
          createdAt={workout.createdAt}
        />

        {/* Action Buttons */}
        {(onEditDate || onMarkComplete || onDelete) && (
          <View style={themed($actionsSection)}>
            {onEditDate && !isCompleted && (
              <>
                <Button
                  preset="default"
                  onPress={() => setShowDatePicker(true)}
                  LeftAccessory={() => (
                    <CalendarIcon size={20} color={theme.colors.palette.neutral100} />
                  )}
                >
                  {workout.scheduledDate ? "Reschedule" : "Schedule"}
                </Button>
                {workout.scheduledDate && (
                  <Button preset="ghost" onPress={handleClearDate}>
                    Clear Date
                  </Button>
                )}
              </>
            )}
            {onMarkComplete && !isCompleted && (
              <Button
                preset="default"
                onPress={onMarkComplete}
                LeftAccessory={() => (
                  <CheckCircleIcon size={20} color={theme.colors.palette.neutral100} />
                )}
              >
                Mark as Complete
              </Button>
            )}
            {onDelete && (
              <Button
                preset="ghost"
                onPress={handleDeletePress}
                LeftAccessory={() => <TrashIcon size={20} color={theme.colors.error} />}
                style={themed($deleteButton)}
              >
                Delete Workout
              </Button>
            )}
          </View>
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={workout.scheduledDate || new Date()}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
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

const $statusSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $statusBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  backgroundColor: colors.palette.neutral100,
  borderRadius: radius.md,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  alignSelf: "flex-start",
})

const $actionsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
  gap: spacing.sm,
})

const $deleteButton: ThemedStyle<ViewStyle> = () => ({
  marginTop: 8,
})
