import { FC, useState } from "react"
import { View, ViewStyle, ScrollView, TouchableOpacity, Alert } from "react-native"
import type { TextStyle } from "react-native"
import { PreviewWorkoutButton } from "expo-workoutkit"
import type {
  WorkoutPlan,
  HKWorkoutActivityType,
  HKWorkoutSessionLocationType,
} from "expo-workoutkit"

import { ActivityCard } from "@/components/ActivityCard"
import { GoalConfiguration } from "@/components/GoalConfiguration"
import { LocationCard, type Location } from "@/components/LocationCard"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutTypeCard, type WorkoutType } from "@/components/WorkoutTypeCard"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

// Workout types configuration
const WORKOUT_TYPES: WorkoutType[] = [
  {
    key: "goal",
    title: "Goal Workout",
    subtitle: "Set a specific target",
    description: "Perfect for focused training sessions",
    icon: "🎯",
    color: "#FF6B6B",
  },
  {
    key: "pacer",
    title: "Pacer Workout",
    subtitle: "Maintain consistent pace",
    description: "Great for endurance training",
    icon: "🏃‍♂️",
    color: "#4ECDC4",
  },
  {
    key: "custom",
    title: "Custom Workout",
    subtitle: "Complex intervals",
    description: "Advanced training protocols",
    icon: "⚡",
    color: "#45B7D1",
  },
]

// Activity categories
const ACTIVITY_CATEGORIES = {
  cardio: [
    { value: "running", label: "Running", icon: "🏃‍♂️", color: "#FF6B6B" },
    { value: "cycling", label: "Cycling", icon: "🚴‍♂️", color: "#4ECDC4" },
    { value: "swimming", label: "Swimming", icon: "🏊‍♂️", color: "#45B7D1" },
    { value: "walking", label: "Walking", icon: "🚶‍♂️", color: "#96CEB4" },
    { value: "mixedCardio", label: "Mixed Cardio", icon: "💪", color: "#FECA57" },
  ],
  strength: [
    { value: "strengthTraining", label: "Strength", icon: "🏋️‍♂️", color: "#FF9FF3" },
    { value: "yoga", label: "Yoga", icon: "🧘‍♀️", color: "#A8E6CF" },
    { value: "pilates", label: "Pilates", icon: "🤸‍♀️", color: "#FFD93D" },
    { value: "crossTraining", label: "Cross Training", icon: "⚡", color: "#FF6B9D" },
  ],
  sports: [
    { value: "tennis", label: "Tennis", icon: "🎾", color: "#6C5CE7" },
    { value: "basketball", label: "Basketball", icon: "🏀", color: "#FD79A8" },
    { value: "soccer", label: "Soccer", icon: "⚽", color: "#00B894" },
    { value: "boxing", label: "Boxing", icon: "🥊", color: "#E17055" },
  ],
}

const LOCATIONS: Location[] = [
  { value: "indoor", label: "Indoor", icon: "🏠", color: "#74B9FF" },
  { value: "outdoor", label: "Outdoor", icon: "🌳", color: "#00B894" },
  { value: "unknown", label: "Unknown", icon: "❓", color: "#636E72" },
]

export const WorkoutBuilderScreenFinal: FC = function WorkoutBuilderScreenFinal() {
  const [selectedType, setSelectedType] = useState<"goal" | "pacer" | "custom">("goal")
  const [selectedActivity, setSelectedActivity] = useState<HKWorkoutActivityType>("running")
  const [selectedLocation, setSelectedLocation] = useState<HKWorkoutSessionLocationType>("outdoor")
  const [goalValue, setGoalValue] = useState("30")
  const [goalUnit, setGoalUnit] = useState("minutes")
  const [generatedWorkout, setGeneratedWorkout] = useState<WorkoutPlan | null>(null)

  const createWorkout = () => {
    try {
      let workout: WorkoutPlan

      switch (selectedType) {
        case "goal":
          workout = {
            type: "goal",
            workout: {
              activity: selectedActivity,
              location: selectedLocation,
              goal: {
                type: "time",
                value: parseInt(goalValue) || 30,
                unit: goalUnit as "seconds" | "minutes" | "hours",
              },
            },
          }
          break

        case "pacer":
          workout = {
            type: "pacer",
            workout: {
              activity: selectedActivity,
              location: selectedLocation,
              distance: {
                value: 5,
                unit: "kilometers",
              },
              time: {
                value: parseInt(goalValue) || 30,
                unit: goalUnit as "seconds" | "minutes" | "hours",
              },
            },
          }
          break

        case "custom":
          workout = {
            type: "custom",
            workout: {
              activity: selectedActivity,
              location: selectedLocation,
              displayName: "Custom Workout",
              warmup: {
                goal: {
                  type: "time",
                  value: 5,
                  unit: "minutes",
                },
              },
              blocks: [
                {
                  steps: [
                    {
                      purpose: "work",
                      step: {
                        goal: {
                          type: "time",
                          value: 1,
                          unit: "minutes",
                        },
                      },
                    },
                    {
                      purpose: "recovery",
                      step: {
                        goal: {
                          type: "time",
                          value: 1,
                          unit: "minutes",
                        },
                      },
                    },
                  ],
                  iterations: 5,
                },
              ],
              cooldown: {
                goal: {
                  type: "time",
                  value: 5,
                  unit: "minutes",
                },
              },
            },
          }
          break

        default:
          throw new Error("Invalid workout type")
      }

      setGeneratedWorkout(workout)
      Alert.alert("Success", "Workout created successfully!")
    } catch {
      Alert.alert("Error", "Failed to create workout")
    }
  }

  const handleButtonPress = ({
    nativeEvent: { message },
  }: {
    nativeEvent: { message: string }
  }) => {
    Alert.alert("Workout Button Pressed", message)
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        {/* Modern Header */}
        <View style={$header}>
          <Text style={$title}>Create Workout</Text>
          <Text style={$subtitle}>Design your perfect training session</Text>
        </View>

        {/* Workout Type Cards */}
        <View style={$section}>
          <Text style={$sectionTitle}>Choose Workout Type</Text>
          <View style={$workoutTypeGrid}>
            {WORKOUT_TYPES.map((type) => (
              <WorkoutTypeCard
                key={type.key}
                type={type}
                isSelected={selectedType === type.key}
                onPress={() => setSelectedType(type.key as any)}
              />
            ))}
          </View>
        </View>

        {/* Activity Selection */}
        <View style={$section}>
          <Text style={$sectionTitle}>Select Activity</Text>
          {Object.entries(ACTIVITY_CATEGORIES).map(([category, activities]) => (
            <View key={category} style={$activityCategory}>
              <Text style={$categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <View style={$activityGrid}>
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.value}
                    activity={activity}
                    isSelected={selectedActivity === activity.value}
                    onPress={() => setSelectedActivity(activity.value as HKWorkoutActivityType)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Location Selection */}
        <View style={$section}>
          <Text style={$sectionTitle}>Location</Text>
          <View style={$locationGrid}>
            {LOCATIONS.map((location) => (
              <LocationCard
                key={location.value}
                location={location}
                isSelected={selectedLocation === location.value}
                onPress={() => setSelectedLocation(location.value as HKWorkoutSessionLocationType)}
              />
            ))}
          </View>
        </View>

        {/* Goal Configuration */}
        <View style={$section}>
          <Text style={$sectionTitle}>Set Your Goal</Text>
          <GoalConfiguration
            goalValue={goalValue}
            goalUnit={goalUnit}
            onGoalValueChange={setGoalValue}
            onGoalUnitChange={setGoalUnit}
          />
        </View>

        {/* Create Button */}
        <View style={$section}>
          <TouchableOpacity style={$createButton} onPress={createWorkout}>
            <Text style={$createButtonText}>Create Workout</Text>
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
const $workoutTypeGrid: ViewStyle = {
  gap: 16,
}

// Activity Styles
const $activityCategory: ViewStyle = {
  marginBottom: 24,
}

const $categoryTitle: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 12,
  textTransform: "capitalize",
}

const $activityGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
}

// Location Styles
const $locationGrid: ViewStyle = {
  flexDirection: "row",
  gap: 16,
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
