import { FC, useState } from "react"
import { View, ViewStyle, ScrollView, TouchableOpacity, Alert } from "react-native"
import type { TextStyle } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { PreviewWorkoutButton } from "expo-workoutkit"
import type {
  WorkoutPlan,
  HKWorkoutActivityType,
  HKWorkoutSessionLocationType,
} from "expo-workoutkit"
import { ArrowLeftIcon } from "react-native-heroicons/outline"

import { Button } from "@/components/Button"
import { CustomWorkoutBuilder } from "@/components/CustomWorkoutBuilder"
import { GoalSelector } from "@/components/GoalSelector"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { WorkoutStorage } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"
import { radius } from "@/theme/spacing"

// Workout types configuration
const WORKOUT_TYPES = [
  {
    key: "goal",
    label: "Goal",
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

const LOCATIONS = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "unknown", label: "Unknown" },
]

export const WorkoutConfigurationScreen: FC = function WorkoutConfigurationScreen() {
  const params = useLocalSearchParams()
  const activity = (params.activity as HKWorkoutActivityType) || "running"

  const [selectedType, setSelectedType] = useState<"goal" | "pacer" | "custom">("goal")
  const [selectedLocation, setSelectedLocation] = useState<HKWorkoutSessionLocationType>("outdoor")
  const [customWorkout, setCustomWorkout] = useState<any>(null)
  const [goalWorkout, setGoalWorkout] = useState<any>(null)
  const [pacerWorkout, setPacerWorkout] = useState<any>(null)
  const [workoutName, setWorkoutName] = useState("")

  const createWorkoutPlan = (): WorkoutPlan => {
    switch (selectedType) {
      case "goal":
        if (!goalWorkout) throw new Error("Goal workout not configured")
        return {
          type: "goal",
          workout: {
            activity,
            location: selectedLocation,
            goal: goalWorkout.goal,
          },
        }

      case "pacer":
        if (!pacerWorkout) throw new Error("Pacer workout not configured")
        return {
          type: "pacer",
          workout: {
            activity,
            location: selectedLocation,
            distance: pacerWorkout.distance,
            time: pacerWorkout.time,
          },
        }

      case "custom":
        if (!customWorkout) throw new Error("Custom workout not configured")
        return {
          type: "custom",
          workout: {
            activity,
            location: selectedLocation,
            ...customWorkout,
          },
        }

      default:
        throw new Error("Invalid workout type")
    }
  }

  const createAndSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Error", "Please enter a workout name")
      return
    }

    try {
      const workout = createWorkoutPlan()

      // Save the workout directly
      const savedWorkout = {
        id: WorkoutStorage.generateId(),
        name: workoutName.trim(),
        workoutPlan: workout,
        createdAt: new Date(),
        activity: activity,
        location: selectedLocation,
      }

      await WorkoutStorage.saveWorkout(savedWorkout)
      Alert.alert("Success", "Workout saved successfully!")

      // Reset form
      setWorkoutName("")
      setGoalWorkout(null)
      setPacerWorkout(null)
      setCustomWorkout(null)
      setSelectedType("goal")

      // Navigate back to builder
      router.back()
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save workout")
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handlePreviewButtonPress = ({
    nativeEvent: { message },
  }: {
    nativeEvent: { message: string }
  }) => {
    Alert.alert("Workout Preview", message)
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
        {/* Workout Name Input */}
        <View style={$section}>
          <Text preset="subheading" size="md">
            Workout Name
          </Text>
          <TextField
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="Enter a name for your workout..."
            autoCapitalize="words"
            returnKeyType="done"
            containerStyle={$nameInputContainer}
          />
        </View>

        {/* Location Selection */}
        <View style={$section}>
          <Text preset="subheading" size="md">
            Location
          </Text>
          <View style={$locationContainer}>
            {LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location.value}
                style={[
                  $locationOption,
                  selectedLocation === location.value && $locationOptionSelected,
                ]}
                onPress={() => setSelectedLocation(location.value as HKWorkoutSessionLocationType)}
              >
                <Text
                  preset="formLabel"
                  size="sm"
                  style={[
                    $locationLabel,
                    selectedLocation === location.value && $locationLabelSelected,
                  ]}
                >
                  {location.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
                onPress={() => setSelectedType(type.key as any)}
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

        {/* Goal Workout Configuration */}
        {selectedType === "goal" && (
          <View style={$section}>
            <Text preset="subheading" size="md">
              Configure Goal
            </Text>
            <GoalSelector
              goal={goalWorkout?.goal}
              onGoalChange={(goal) =>
                setGoalWorkout({
                  ...goalWorkout,
                  goal,
                })
              }
            />
          </View>
        )}

        {/* Pacer Workout Configuration */}
        {selectedType === "pacer" && (
          <View style={$section}>
            <Text preset="subheading" size="md">
              Configure Pace
            </Text>
            <View style={$pacerContainer}>
              <Text preset="formLabel" size="sm">
                Distance
              </Text>
              <GoalSelector
                goal={pacerWorkout?.distance}
                onGoalChange={(distance) =>
                  setPacerWorkout({
                    ...pacerWorkout,
                    distance,
                  })
                }
              />
              <Text preset="formLabel" size="sm">
                Time
              </Text>
              <GoalSelector
                goal={pacerWorkout?.time}
                onGoalChange={(time) =>
                  setPacerWorkout({
                    ...pacerWorkout,
                    time,
                  })
                }
              />
            </View>
          </View>
        )}

        {/* Custom Workout Builder */}
        {selectedType === "custom" && (
          <View style={$section}>
            <Text preset="subheading" size="md">
              Configure Custom Workout
            </Text>
            <CustomWorkoutBuilder workout={customWorkout} onWorkoutChange={setCustomWorkout} />
          </View>
        )}

        {/* Workout Preview */}
        {((selectedType === "goal" && goalWorkout) ||
          (selectedType === "pacer" && pacerWorkout) ||
          (selectedType === "custom" && customWorkout)) && (
          <View style={$section}>
            <Text preset="subheading" size="md">
              Workout Preview
            </Text>
            <View style={$previewContainer}>
              <PreviewWorkoutButton
                workoutPlan={createWorkoutPlan()}
                onButtonPress={handlePreviewButtonPress}
                label="Start Workout"
                style={$previewButtonStyle}
                buttonColor={colors.tint}
                textColor={colors.palette.neutral100}
                cornerRadius={radius.md}
                fontSize={16}
              />
            </View>
          </View>
        )}

        {/* Save Button */}
        <View style={$section}>
          <Button
            text={
              (selectedType === "goal" && !goalWorkout) ||
              (selectedType === "pacer" && !pacerWorkout) ||
              (selectedType === "custom" && !customWorkout)
                ? "Configure Workout First"
                : !workoutName.trim()
                  ? "Enter Workout Name"
                  : "Save Workout"
            }
            onPress={createAndSaveWorkout}
            disabled={
              (selectedType === "goal" && !goalWorkout) ||
              (selectedType === "pacer" && !pacerWorkout) ||
              (selectedType === "custom" && !customWorkout) ||
              !workoutName.trim()
            }
          />
        </View>
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
const $locationContainer: ViewStyle = {
  flexDirection: "row",
  gap: 12,
}

const $locationOption: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 16,
  paddingHorizontal: 12,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
}

const $locationOptionSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $locationLabel: TextStyle = {
  textAlign: "center",
}

const $locationLabelSelected: TextStyle = {
  color: colors.palette.neutral100,
}

// Pacer Configuration Styles
const $pacerContainer: ViewStyle = {
  gap: 16,
}

const $nameInputContainer: ViewStyle = {
  marginBottom: 0,
}

// Preview Container
const $previewContainer: ViewStyle = {
  alignItems: "center",
}

const $previewButtonStyle: ViewStyle = {
  height: 56,
  width: "100%",
  borderRadius: radius.md,
  backgroundColor: colors.tint,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}
