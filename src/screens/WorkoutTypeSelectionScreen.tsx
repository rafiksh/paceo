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

import { CustomWorkoutBuilder } from "@/components/CustomWorkoutBuilder"
import { GoalSelector } from "@/components/GoalSelector"
import { LocationDropdown, type Location } from "@/components/LocationDropdown"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { WorkoutStorage } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

// Workout types configuration
const WORKOUT_TYPES = [
  {
    key: "goal",
    label: "Goal Workout",
    description: "Set a specific target",
  },
  {
    key: "pacer",
    label: "Pacer Workout",
    description: "Maintain consistent pace",
  },
  {
    key: "custom",
    label: "Custom Workout",
    description: "Complex intervals with blocks",
  },
]

const LOCATIONS: Location[] = [
  { value: "indoor", label: "Indoor", icon: "🏠", color: "#74B9FF" },
  { value: "outdoor", label: "Outdoor", icon: "🌳", color: "#00B894" },
  { value: "unknown", label: "Unknown", icon: "❓", color: "#636E72" },
]

export const WorkoutTypeSelectionScreen: FC = function WorkoutTypeSelectionScreen() {
  const params = useLocalSearchParams()
  const activity = (params.activity as HKWorkoutActivityType) || "running"

  const [selectedType, setSelectedType] = useState<"goal" | "pacer" | "custom">("goal")
  const [selectedLocation, setSelectedLocation] = useState<HKWorkoutSessionLocationType>("outdoor")
  const [generatedWorkout, setGeneratedWorkout] = useState<WorkoutPlan | null>(null)
  const [customWorkout, setCustomWorkout] = useState<any>(null)
  const [goalWorkout, setGoalWorkout] = useState<any>(null)
  const [pacerWorkout, setPacerWorkout] = useState<any>(null)
  const [workoutName, setWorkoutName] = useState("")

  const createWorkout = () => {
    try {
      let workout: WorkoutPlan

      switch (selectedType) {
        case "goal":
          if (goalWorkout) {
            workout = {
              type: "goal",
              workout: {
                activity,
                location: selectedLocation,
                goal: goalWorkout.goal,
              },
            }
          } else {
            throw new Error("Please configure your goal workout first")
          }
          break

        case "pacer":
          if (pacerWorkout) {
            workout = {
              type: "pacer",
              workout: {
                activity,
                location: selectedLocation,
                distance: pacerWorkout.distance,
                time: pacerWorkout.time,
              },
            }
          } else {
            throw new Error("Please configure your pacer workout first")
          }
          break

        case "custom":
          if (customWorkout) {
            workout = {
              type: "custom",
              workout: {
                activity,
                location: selectedLocation,
                ...customWorkout,
              },
            }
          } else {
            throw new Error("Please configure your custom workout first")
          }
          break

        default:
          throw new Error("Invalid workout type")
      }

      setGeneratedWorkout(workout)
      Alert.alert("Success", "Workout created successfully!")
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create workout")
    }
  }

  const saveWorkout = async () => {
    if (!generatedWorkout) {
      Alert.alert("Error", "No workout to save")
      return
    }

    if (!workoutName.trim()) {
      Alert.alert("Error", "Please enter a workout name")
      return
    }

    try {
      const savedWorkout = {
        id: WorkoutStorage.generateId(),
        name: workoutName.trim(),
        workoutPlan: generatedWorkout,
        createdAt: new Date(),
        activity: activity,
        location: selectedLocation,
      }

      await WorkoutStorage.saveWorkout(savedWorkout)
      Alert.alert("Success", "Workout saved successfully!")
      setWorkoutName("")
      setGeneratedWorkout(null)
    } catch {
      Alert.alert("Error", "Failed to save workout")
    }
  }

  const handleButtonPress = ({
    nativeEvent: { message },
  }: {
    nativeEvent: { message: string }
  }) => {
    Alert.alert("Workout Button Pressed", message)
  }

  const handleBack = () => {
    router.push("/(tabs)/builder")
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        {/* Header */}
        <View style={$header}>
          <TouchableOpacity style={$backButton} onPress={handleBack}>
            <Text style={$backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={$title}>Choose Workout Type</Text>
          <Text style={$subtitle}>{activity.charAt(0).toUpperCase() + activity.slice(1)}</Text>
        </View>

        {/* Location Selection */}
        <View style={$section}>
          <Text style={$sectionTitle}>Location</Text>
          <LocationDropdown
            locations={LOCATIONS}
            selectedLocation={selectedLocation}
            onLocationChange={(location) =>
              setSelectedLocation(location as HKWorkoutSessionLocationType)
            }
          />
        </View>

        {/* Workout Type Selection */}
        <View style={$section}>
          <Text style={$sectionTitle}>Workout Type</Text>
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
                <View style={$workoutTypeContent}>
                  <Text
                    style={[
                      $workoutTypeLabel,
                      selectedType === type.key && $workoutTypeLabelSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text
                    style={[
                      $workoutTypeDescription,
                      selectedType === type.key && $workoutTypeDescriptionSelected,
                    ]}
                  >
                    {type.description}
                  </Text>
                </View>
                <View
                  style={[
                    $workoutTypeRadio,
                    selectedType === type.key && $workoutTypeRadioSelected,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goal Workout Configuration */}
        {selectedType === "goal" && (
          <View style={$section}>
            <Text style={$sectionTitle}>Configure Goal</Text>
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
            <Text style={$sectionTitle}>Configure Pace</Text>
            <View style={$pacerContainer}>
              <Text style={$pacerLabel}>Distance</Text>
              <GoalSelector
                goal={pacerWorkout?.distance}
                onGoalChange={(distance) =>
                  setPacerWorkout({
                    ...pacerWorkout,
                    distance,
                  })
                }
              />
              <Text style={$pacerLabel}>Time</Text>
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
            <Text style={$sectionTitle}>Configure Custom Workout</Text>
            <CustomWorkoutBuilder workout={customWorkout} onWorkoutChange={setCustomWorkout} />
          </View>
        )}

        {/* Create Button */}
        <View style={$section}>
          <TouchableOpacity
            style={[
              $createButton,
              ((selectedType === "goal" && !goalWorkout) ||
                (selectedType === "pacer" && !pacerWorkout) ||
                (selectedType === "custom" && !customWorkout)) &&
                $createButtonDisabled,
            ]}
            onPress={createWorkout}
            disabled={
              (selectedType === "goal" && !goalWorkout) ||
              (selectedType === "pacer" && !pacerWorkout) ||
              (selectedType === "custom" && !customWorkout)
            }
          >
            <Text
              style={[
                $createButtonText,
                ((selectedType === "goal" && !goalWorkout) ||
                  (selectedType === "pacer" && !pacerWorkout) ||
                  (selectedType === "custom" && !customWorkout)) &&
                  $createButtonTextDisabled,
              ]}
            >
              {(selectedType === "goal" && !goalWorkout) ||
              (selectedType === "pacer" && !pacerWorkout) ||
              (selectedType === "custom" && !customWorkout)
                ? "Configure Workout First"
                : "Create Workout"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Generated Workout Preview */}
        {generatedWorkout && (
          <View style={$section}>
            <Text style={$sectionTitle}>Preview</Text>
            <View style={$previewContainer}>
              <PreviewWorkoutButton
                workoutPlan={generatedWorkout}
                onButtonPress={handleButtonPress}
                style={$previewButton}
              />
            </View>

            {/* Save Workout */}
            <View style={$saveContainer}>
              <Text style={$saveLabel}>Save Workout</Text>
              <Text style={$saveInputLabel}>Workout Name</Text>
              <TextField
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="Enter a name for your workout..."
                autoCapitalize="words"
                returnKeyType="done"
                containerStyle={$saveInputContainer}
                style={$saveInputField}
              />

              {workoutName.trim() && (
                <TouchableOpacity style={$saveWorkoutButton} onPress={saveWorkout}>
                  <Text style={$saveWorkoutButtonText}>Save Workout</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

// Styles
const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $scrollContent: ViewStyle = {
  paddingBottom: 40,
}

const $header: ViewStyle = {
  paddingHorizontal: 24,
  paddingVertical: 40,
  alignItems: "center",
}

const $backButton: ViewStyle = {
  alignSelf: "flex-start",
  marginBottom: 20,
  paddingVertical: 8,
  paddingHorizontal: 16,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
}

const $backButtonText: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $title: TextStyle = {
  fontSize: 32,
  fontWeight: "800",
  color: colors.text,
  fontFamily: typography.primary.bold,
  marginBottom: 8,
  letterSpacing: -0.5,
}

const $subtitle: TextStyle = {
  fontSize: 16,
  fontWeight: "400",
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
}

const $section: ViewStyle = {
  paddingHorizontal: 24,
  marginBottom: 32,
}

const $sectionTitle: TextStyle = {
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
  fontFamily: typography.primary.bold,
  marginBottom: 20,
  letterSpacing: -0.3,
}

// Workout Type Styles
const $workoutTypeContainer: ViewStyle = {
  gap: 8,
}

const $workoutTypeOption: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 16,
  paddingHorizontal: 20,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
}

const $workoutTypeOptionSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $workoutTypeContent: ViewStyle = {
  flex: 1,
}

const $workoutTypeLabel: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 2,
}

const $workoutTypeLabelSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $workoutTypeDescription: TextStyle = {
  fontSize: 14,
  fontWeight: "400",
  color: colors.textDim,
  fontFamily: typography.primary.normal,
}

const $workoutTypeDescriptionSelected: TextStyle = {
  color: colors.palette.neutral300,
}

const $workoutTypeRadio: ViewStyle = {
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: colors.border,
  backgroundColor: colors.background,
}

const $workoutTypeRadioSelected: ViewStyle = {
  borderColor: colors.palette.neutral100,
  backgroundColor: colors.palette.neutral100,
}

// Pacer Configuration Styles
const $pacerContainer: ViewStyle = {
  gap: 16,
}

const $pacerLabel: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 8,
}

// Button Styles
const $createButton: ViewStyle = {
  backgroundColor: colors.tint,
  borderRadius: 16,
  paddingVertical: 18,
  alignItems: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}

const $createButtonText: TextStyle = {
  fontSize: 16,
  fontWeight: "700",
  color: colors.palette.neutral100,
  fontFamily: typography.primary.bold,
}

const $createButtonDisabled: ViewStyle = {
  backgroundColor: colors.border,
  shadowOpacity: 0,
  elevation: 0,
}

const $createButtonTextDisabled: TextStyle = {
  color: colors.textDim,
}

// Preview Styles
const $previewContainer: ViewStyle = {
  alignItems: "center",
}

const $previewButton: ViewStyle = {
  height: 120,
  width: "100%",
  borderRadius: 16,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.border,
}

// Save Workout Styles
const $saveContainer: ViewStyle = {
  marginTop: 20,
  padding: 16,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
}

const $saveLabel: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 12,
}

const $saveInputLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "500",
  color: colors.textDim,
  fontFamily: typography.primary.medium,
  marginBottom: 8,
}

const $saveInputContainer: ViewStyle = {
  marginBottom: 12,
}

const $saveInputField: TextStyle = {
  fontSize: 14,
  fontWeight: "400",
  color: colors.text,
  fontFamily: typography.primary.normal,
}

const $saveWorkoutButton: ViewStyle = {
  backgroundColor: colors.palette.neutral900,
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 16,
  alignItems: "center",
}

const $saveWorkoutButtonText: TextStyle = {
  fontSize: 16,
  fontWeight: "700",
  color: colors.palette.neutral100,
  fontFamily: typography.primary.bold,
}
