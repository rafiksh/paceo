import { FC, useState, useEffect } from "react"
import { View, ViewStyle, ScrollView, TouchableOpacity, Alert } from "react-native"
import type { TextStyle } from "react-native"
import { PreviewWorkoutButton } from "expo-workoutkit"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"

export const SavedWorkoutsScreen: FC = function SavedWorkoutsScreen() {
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkouts()
  }, [])

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

  const handleButtonPress = (message: string) => {
    Alert.alert("Workout Button Pressed", message)
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
            await loadWorkouts()
          } catch {
            Alert.alert("Error", "Failed to delete workout")
          }
        },
      },
    ])
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <View style={$header}>
        <Text preset="heading">My Workouts</Text>
        <Text preset="subheading">Your personal training collection</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContainer}>
        {loading ? (
          <View style={$emptyState}>
            <Text preset="heading" size="lg">
              Loading...
            </Text>
          </View>
        ) : savedWorkouts.length === 0 ? (
          <View style={$emptyState}>
            <Text style={$emptyIcon}>📝</Text>
            <Text preset="heading" size="lg">
              No Workouts Yet
            </Text>
            <Text preset="subheading" size="md" style={$emptyDescription}>
              Create your first workout in the Builder tab to get started with your fitness journey.
            </Text>
          </View>
        ) : (
          <View style={$workoutsList}>
            {savedWorkouts.map((savedWorkout) => (
              <View key={savedWorkout.id} style={$workoutCard}>
                {/* Workout Header */}
                <View style={$workoutHeader}>
                  <View style={$workoutTitleContainer}>
                    <Text preset="heading" size="lg">
                      {savedWorkout.name}
                    </Text>
                    <Text preset="formHelper" size="xs" style={$workoutDate}>
                      {savedWorkout.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={$deleteButton}
                    onPress={() => handleDeleteWorkout(savedWorkout.id)}
                  >
                    <Text style={$deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* Workout Info */}
                <View style={$workoutInfo}>
                  <View style={$workoutActivityContainer}>
                    <Text style={$workoutActivityIcon}>
                      {savedWorkout.activity === "running"
                        ? "🏃‍♂️"
                        : savedWorkout.activity === "cycling"
                          ? "🚴‍♂️"
                          : savedWorkout.activity === "swimming"
                            ? "🏊‍♂️"
                            : savedWorkout.activity === "walking"
                              ? "🚶‍♂️"
                              : savedWorkout.activity === "strengthTraining"
                                ? "🏋️‍♂️"
                                : savedWorkout.activity === "yoga"
                                  ? "🧘‍♀️"
                                  : "💪"}
                    </Text>
                    <Text preset="formLabel" size="sm">
                      {savedWorkout.activity.charAt(0).toUpperCase() +
                        savedWorkout.activity.slice(1)}
                    </Text>
                  </View>
                  <View style={$workoutLocationContainer}>
                    <Text style={$workoutLocationIcon}>
                      {savedWorkout.location === "indoor" ? "🏠" : "🌳"}
                    </Text>
                    <Text preset="formHelper" size="xs">
                      {savedWorkout.location.charAt(0).toUpperCase() +
                        savedWorkout.location.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Workout Preview */}
                <View style={$workoutPreview}>
                  <PreviewWorkoutButton
                    workoutPlan={savedWorkout.workoutPlan}
                    onButtonPress={({ nativeEvent }) => handleButtonPress(nativeEvent.message)}
                    label="Start Workout"
                    buttonColor={colors.tint}
                    textColor={colors.palette.neutral100}
                    cornerRadius={12}
                    fontSize={16}
                    style={$previewButton}
                  />
                </View>
              </View>
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
  backgroundColor: colors.background,
}

const $scrollContainer: ViewStyle = {
  paddingHorizontal: 24,
  paddingBottom: 40,
}

const $header: ViewStyle = {
  paddingHorizontal: 24,
  paddingVertical: 40,
  alignItems: "center",
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

const $emptyDescription: TextStyle = {
  textAlign: "center",
  lineHeight: 24,
}

// Workouts List
const $workoutsList: ViewStyle = {
  gap: 16,
}

const $workoutCard: ViewStyle = {
  backgroundColor: colors.background,
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
}

const $workoutHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
}

const $workoutTitleContainer: ViewStyle = {
  flex: 1,
}

const $workoutDate: TextStyle = {
  marginTop: 4,
}

const $workoutInfo: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 20,
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
}

const $workoutActivityContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $workoutActivityIcon: TextStyle = {
  fontSize: 18,
  marginRight: 8,
}

const $workoutLocationContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $workoutLocationIcon: TextStyle = {
  fontSize: 16,
  marginRight: 6,
}

const $workoutPreview: ViewStyle = {
  marginBottom: 0,
}

const $previewButton: ViewStyle = {
  height: 56,
  borderRadius: 12,
}

const $deleteButton: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "#FF6B6B",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#FF6B6B",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 3,
}

const $deleteIcon: TextStyle = {
  fontSize: 16,
}
