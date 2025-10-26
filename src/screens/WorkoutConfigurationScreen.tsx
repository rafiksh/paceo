import { FC, useState } from "react"
import { View, ViewStyle, TextStyle, ScrollView, TouchableOpacity, Alert } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import type {
  WorkoutPlan,
  HKWorkoutActivityType,
  SingleGoalWorkout,
  PacerWorkout,
} from "expo-workoutkit"
import { format } from "date-fns"
import { ArrowLeftIcon, CalendarIcon } from "react-native-heroicons/outline"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { SimpleWorkoutForm, PacerWorkoutForm, CustomWorkoutForm } from "@/components/WorkoutForm"
import { ButtonSelector } from "@/components/WorkoutForm/ButtonSelector"
import { WorkoutStorage } from "@/services/WorkoutStorage"
import { useAppTheme } from "@/theme/context"
import { radius } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"
import type {
  SimpleWorkoutFormData,
  PacerWorkoutFormData,
  CustomWorkoutFormData,
} from "@/types/WorkoutFormData"

// Workout type selection

// Workout types configuration
const WORKOUT_TYPES = [
  {
    key: "goal",
    label: "Simple",
  },
  {
    key: "pacer",
    label: "Pacer",
  },
  {
    key: "custom",
    label: "Custom",
  },
]

export const WorkoutConfigurationScreen: FC = function WorkoutConfigurationScreen() {
  const { themed, theme } = useAppTheme()
  const params = useLocalSearchParams()
  const activity = (params.activity as HKWorkoutActivityType) || "running"
  const scheduledDate = params.scheduledDate ? new Date(params.scheduledDate as string) : undefined

  const [selectedType, setSelectedType] = useState<"goal" | "pacer" | "custom">("goal")

  const createWorkoutPlan = (
    data: SimpleWorkoutFormData | PacerWorkoutFormData | CustomWorkoutFormData,
    type: string,
  ): WorkoutPlan => {
    switch (type) {
      case "goal": {
        const simpleData = data as SimpleWorkoutFormData
        return {
          type: "goal",
          workout: {
            activity,
            location: simpleData.selectedLocation,
            goal: {
              type: simpleData.goal.type as "time" | "distance" | "energy",
              value: simpleData.goal.value!,
              unit: simpleData.goal.unit!,
            },
          } as SingleGoalWorkout,
        }
      }

      case "pacer": {
        const pacerData = data as PacerWorkoutFormData

        // Convert abbreviated units to full unit names
        const distanceUnitMap: Record<string, string> = {
          m: "meters",
          km: "kilometers",
          yd: "yards",
          mi: "miles",
          ft: "feet",
        }

        const timeUnitMap: Record<string, string> = {
          "sec": "seconds",
          "min": "minutes",
          "hr": "hours",
          "min/km": "minutes", // For pace, we'll use minutes as the base unit
          "min/mi": "minutes",
          "s/100m": "seconds",
        }
        return {
          type: "pacer",
          workout: {
            activity,
            location: pacerData.selectedLocation,
            distance: {
              value: pacerData.distance.value!,
              unit: distanceUnitMap[pacerData.distance.unit!] as
                | "meters"
                | "kilometers"
                | "yards"
                | "miles"
                | "feet",
            },
            time: {
              value: pacerData.time.value!,
              unit: timeUnitMap[pacerData.time.unit!] as "seconds" | "minutes" | "hours",
            },
          } as PacerWorkout,
        }
      }

      case "custom": {
        const customData = data as CustomWorkoutFormData
        if (!customData.customWorkout) {
          throw new Error("Custom workout data is required")
        }
        return {
          type: "custom",
          workout: customData.customWorkout,
        }
      }

      default:
        throw new Error("Invalid workout type")
    }
  }

  const handleSimpleWorkoutSubmit = async (data: SimpleWorkoutFormData) => {
    try {
      const workout = createWorkoutPlan(data, "goal")
      await saveWorkout(data.workoutName, workout, data.selectedLocation)
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save workout")
    }
  }

  const handlePacerWorkoutSubmit = async (data: PacerWorkoutFormData) => {
    try {
      const workout = createWorkoutPlan(data, "pacer")
      await saveWorkout(data.workoutName, workout, data.selectedLocation)
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save workout")
    }
  }

  const handleCustomWorkoutSubmit = async (data: CustomWorkoutFormData) => {
    try {
      const workout = createWorkoutPlan(data, "custom")
      await saveWorkout(data.workoutName, workout, data.selectedLocation)
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save workout")
    }
  }

  const saveWorkout = async (name: string, workout: WorkoutPlan, location: string) => {
    const savedWorkout = {
      id: WorkoutStorage.generateId(),
      name: name.trim(),
      workoutPlan:
        workout.type === "custom"
          ? { ...workout, workout: { ...workout.workout, displayName: name.trim() } }
          : workout,
      createdAt: new Date(),
      activity: activity,
      location: location,
      origin: "manual" as const,
      scheduledDate,
      status: scheduledDate ? ("scheduled" as const) : ("unscheduled" as const),
    }

    await WorkoutStorage.saveWorkout(savedWorkout)
    Alert.alert("Success", "Workout saved successfully!")
    router.replace("/home")
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["top"]}>
      <View style={themed($header)}>
        <TouchableOpacity style={themed($backButton)} onPress={handleBack}>
          <ArrowLeftIcon size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={themed($headerContent)}>
          <Text preset="heading" size="lg">
            Configure Workout
          </Text>
          <Text preset="formHelper" size="md">
            {activity.charAt(0).toUpperCase() + activity.slice(1)}
          </Text>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themed($scrollContent)}
      >
        {/* Scheduled Date Badge */}
        {scheduledDate && (
          <View style={themed($dateBadge)}>
            <CalendarIcon size={16} color={theme.colors.tint} />
            <Text preset="formHelper" style={themed($dateText)}>
              Scheduled for {format(scheduledDate, "EEE, MMM d 'at' h:mm a")}
            </Text>
          </View>
        )}

        {/* Workout Type Selection */}
        <View style={themed($section)}>
          <Text preset="subheading" size="md">
            Workout Type
          </Text>
          <ButtonSelector
            options={WORKOUT_TYPES}
            selectedValue={selectedType}
            onValueChange={(value) => setSelectedType(value as "goal" | "pacer" | "custom")}
          />
        </View>

        {/* Render appropriate form based on selected type */}
        {selectedType === "goal" && <SimpleWorkoutForm onSubmit={handleSimpleWorkoutSubmit} />}

        {selectedType === "pacer" && <PacerWorkoutForm onSubmit={handlePacerWorkoutSubmit} />}

        {selectedType === "custom" && <CustomWorkoutForm onSubmit={handleCustomWorkoutSubmit} />}
      </ScrollView>
    </Screen>
  )
}

// Styles
const $container: ViewStyle = {
  flex: 1,
}

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  gap: spacing.md,
})

const $backButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.border,
})

const $headerContent: ViewStyle = {
  flex: 1,
}

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $dateBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  backgroundColor: colors.palette.neutral100,
  borderRadius: radius.md,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  marginBottom: spacing.lg,
  alignSelf: "flex-start",
})

const $dateText: TextStyle = {
  // No theme-specific styling needed here
}
