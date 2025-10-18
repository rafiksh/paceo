import { FC, useState } from "react"
import { View, ViewStyle, ScrollView, TouchableOpacity, Alert } from "react-native"
import type { TextStyle } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import type {
  WorkoutPlan,
  HKWorkoutActivityType,
  SingleGoalWorkout,
  PacerWorkout,
} from "expo-workoutkit"
import { ArrowLeftIcon } from "react-native-heroicons/outline"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { SimpleWorkoutForm, PacerWorkoutForm, CustomWorkoutForm } from "@/components/WorkoutForm"
import { WorkoutStorage } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"
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
  const params = useLocalSearchParams()
  const activity = (params.activity as HKWorkoutActivityType) || "running"

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
      workoutPlan: workout,
      createdAt: new Date(),
      activity: activity,
      location: location,
    }

    await WorkoutStorage.saveWorkout(savedWorkout)
    Alert.alert("Success", "Workout saved successfully!")
    router.back()
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <View style={$header}>
        <TouchableOpacity style={$backButton} onPress={handleBack}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={$headerContent}>
          <Text preset="heading" size="lg">
            Configure Workout
          </Text>
          <Text preset="formHelper" size="md">
            {activity.charAt(0).toUpperCase() + activity.slice(1)}
          </Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        {/* Workout Type Selection */}
        <View style={$section}>
          <Text preset="subheading" size="md">
            Workout Type
          </Text>
          <View style={$workoutTypeContainer}>
            {WORKOUT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  $workoutTypeOption,
                  selectedType === type.key && $workoutTypeOptionSelected,
                ]}
                onPress={() => setSelectedType(type.key as "goal" | "pacer" | "custom")}
              >
                <Text
                  preset="formLabel"
                  size="sm"
                  style={[
                    $workoutTypeLabel,
                    selectedType === type.key && $workoutTypeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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

const $scrollContent: ViewStyle = {
  paddingVertical: 40,
  paddingHorizontal: 24,
}

const $header: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 24,
  paddingVertical: 16,
  gap: 16,
}

const $backButton: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.border,
}

const $headerContent: ViewStyle = {
  flex: 1,
}

const $section: ViewStyle = {
  marginBottom: 32,
}

// Workout Type Styles
const $workoutTypeContainer: ViewStyle = {
  flexDirection: "row",
  gap: 12,
}

const $workoutTypeOption: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 16,
  paddingHorizontal: 12,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  gap: 4,
}

const $workoutTypeOptionSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $workoutTypeLabel: TextStyle = {
  textAlign: "center",
}

const $workoutTypeLabelSelected: TextStyle = {
  color: colors.palette.neutral100,
}

// Location Styles
