import { FC, useState } from "react"
import { View, ViewStyle, ScrollView } from "react-native"
import type { TextStyle } from "react-native"
import type { WorkoutPlan } from "expo-workoutkit"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutCard } from "@/components/WorkoutCard"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

// Mock saved workouts with better data
const MOCK_WORKOUTS: WorkoutPlan[] = [
  {
    type: "goal",
    workout: {
      activity: "running",
      location: "outdoor",
      goal: {
        type: "time",
        value: 30,
        unit: "minutes",
      },
    },
  },
  {
    type: "pacer",
    workout: {
      activity: "cycling",
      location: "outdoor",
      distance: {
        value: 10,
        unit: "kilometers",
      },
      time: {
        value: 45,
        unit: "minutes",
      },
    },
  },
  {
    type: "custom",
    workout: {
      activity: "swimming",
      location: "indoor",
      displayName: "Swim Intervals",
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
                  value: 2,
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
          iterations: 8,
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
  },
]

export const SavedWorkoutsScreenFinal: FC = function SavedWorkoutsScreenFinal() {
  const [savedWorkouts, setSavedWorkouts] = useState<WorkoutPlan[]>(MOCK_WORKOUTS)

  const handleButtonPress = (message: string) => {
    // Handle workout button press
    console.log("Workout button pressed:", message)
  }

  const handleDeleteWorkout = (index: number) => {
    setSavedWorkouts((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        {/* Modern Header */}
        <View style={$header}>
          <Text style={$title}>My Workouts</Text>
          <Text style={$subtitle}>Your personal training collection</Text>
        </View>

        {/* Workouts List */}
        <View style={$section}>
          {savedWorkouts.length === 0 ? (
            <View style={$emptyState}>
              <Text style={$emptyIcon}>📝</Text>
              <Text style={$emptyTitle}>No Workouts Yet</Text>
              <Text style={$emptyDescription}>
                Create your first workout in the Builder tab to get started with your fitness
                journey.
              </Text>
            </View>
          ) : (
            <View style={$workoutsList}>
              {savedWorkouts.map((workout, index) => (
                <WorkoutCard
                  key={index}
                  workout={workout}
                  index={index}
                  onDelete={handleDeleteWorkout}
                  onButtonPress={handleButtonPress}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  )
}

// Modern Styles
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
}

// Empty State
const $emptyState: ViewStyle = {
  alignItems: "center",
  paddingVertical: 80,
  paddingHorizontal: 40,
}

const $emptyIcon: TextStyle = {
  fontSize: 64,
  marginBottom: 24,
}

const $emptyTitle: TextStyle = {
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  fontFamily: typography.primary.bold,
  marginBottom: 12,
  textAlign: "center",
}

const $emptyDescription: TextStyle = {
  fontSize: 16,
  fontWeight: "400",
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
  lineHeight: 24,
}

// Workouts List
const $workoutsList: ViewStyle = {
  gap: 20,
}
