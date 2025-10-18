import { FC, useState, useEffect } from "react"
import { View, ViewStyle, ScrollView, TouchableOpacity, Alert } from "react-native"
import type { TextStyle } from "react-native"
import { PreviewWorkoutButton } from "expo-workoutkit"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

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
    <Screen preset="scroll" contentContainerStyle={$container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        {/* Modern Header */}
        <View style={$header}>
          <Text style={$title}>My Workouts</Text>
          <Text style={$subtitle}>Your personal training collection</Text>
        </View>

        {/* Workouts List */}
        <View style={$section}>
          {loading ? (
            <View style={$emptyState}>
              <Text style={$emptyTitle}>Loading...</Text>
            </View>
          ) : savedWorkouts.length === 0 ? (
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
              {savedWorkouts.map((savedWorkout) => (
                <View key={savedWorkout.id} style={$workoutCard}>
                  {/* Workout Header */}
                  <View style={$workoutHeader}>
                    <View style={$workoutTitleContainer}>
                      <Text style={$workoutName}>{savedWorkout.name}</Text>
                      <Text style={$workoutDate}>
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
                      <Text style={$workoutActivity}>
                        {savedWorkout.activity.charAt(0).toUpperCase() +
                          savedWorkout.activity.slice(1)}
                      </Text>
                    </View>
                    <View style={$workoutLocationContainer}>
                      <Text style={$workoutLocationIcon}>
                        {savedWorkout.location === "indoor" ? "🏠" : "🌳"}
                      </Text>
                      <Text style={$workoutLocation}>
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

const $workoutName: TextStyle = {
  fontSize: 20,
  fontWeight: "800",
  color: colors.text,
  fontFamily: typography.primary.bold,
  marginBottom: 4,
  letterSpacing: -0.3,
}

const $workoutDate: TextStyle = {
  fontSize: 13,
  fontWeight: "500",
  color: colors.textDim,
  fontFamily: typography.primary.medium,
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

const $workoutActivity: TextStyle = {
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $workoutLocationContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $workoutLocationIcon: TextStyle = {
  fontSize: 16,
  marginRight: 6,
}

const $workoutLocation: TextStyle = {
  fontSize: 14,
  fontWeight: "500",
  color: colors.textDim,
  fontFamily: typography.primary.medium,
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
