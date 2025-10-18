import { FC, useState, useEffect } from "react"
import { View, ViewStyle, ScrollView, TouchableOpacity, Alert } from "react-native"
import type { TextStyle } from "react-native"
import { PreviewWorkoutButton } from "expo-workoutkit"
import { TrashIcon, HeartIcon, HomeIcon, SunIcon } from "react-native-heroicons/outline"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"

// Helper function to calculate workout duration and intensity
export const SavedWorkoutsScreen: FC = function SavedWorkoutsScreen() {
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([])
  const [loading, setLoading] = useState(true)

  const getWorkoutSummary = (workoutPlan: any): string => {
    if (!workoutPlan || !workoutPlan.type) {
      return "Workout Plan"
    }

    switch (workoutPlan.type) {
      case "goal":
        if (workoutPlan.workout?.goal?.type === "time" && workoutPlan.workout.goal.value) {
          return `Goal: ${workoutPlan.workout.goal.value} ${workoutPlan.workout.goal.unit || "min"}`
        } else if (
          workoutPlan.workout?.goal?.type === "distance" &&
          workoutPlan.workout.goal.value
        ) {
          return `Goal: ${workoutPlan.workout.goal.value} ${workoutPlan.workout.goal.unit || "km"}`
        } else {
          return "Open Goal Workout"
        }
      case "pacer":
        const distance = workoutPlan.workout?.distance?.value
        const time = workoutPlan.workout?.time?.value
        if (distance && time) {
          return `${distance}km in ${time}min`
        }
        return "Pacer Workout"
      case "custom":
        const blockCount = workoutPlan.workout?.blocks?.length || 0
        return `Custom: ${blockCount} interval${blockCount !== 1 ? "s" : ""}`
      default:
        return "Workout Plan"
    }
  }

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
    <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <View style={$header}>
        <Text preset="heading">My Workouts</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContainer}>
        {loading ? (
          <View style={$loadingContainer}>
            {[1, 2, 3].map((index) => (
              <View key={index} style={$skeletonCard}>
                <View style={$skeletonHeader}>
                  <View style={$skeletonTitle} />
                  <View style={$skeletonDelete} />
                </View>
                <View style={$skeletonStats}>
                  <View style={$skeletonStat} />
                  <View style={$skeletonStat} />
                  <View style={$skeletonStat} />
                </View>
                <View style={$skeletonButton} />
              </View>
            ))}
          </View>
        ) : savedWorkouts.length === 0 ? (
          <View style={$emptyState}>
            <View style={$emptyIconContainer}>
              <HeartIcon size={32} color={colors.tint} />
            </View>
            <Text preset="heading" size="lg">
              Ready to Build?
            </Text>
            <Text preset="subheading" size="md" style={$emptyDescription}>
              Create your first personalized workout in the Builder tab and start your fitness
              journey.
            </Text>
            <View style={$emptyAction}>
              <Text preset="formHelper" size="xs" style={$emptyActionText}>
                Tap the Builder tab to get started
              </Text>
            </View>
          </View>
        ) : (
          <View style={$workoutsList}>
            {savedWorkouts.map((savedWorkout) => (
              <View key={savedWorkout.id} style={$workoutCard}>
                {/* Header Row */}
                <View style={$workoutHeader}>
                  <View style={$workoutInfo}>
                    <Text preset="heading" size="sm" style={$workoutName}>
                      {savedWorkout.name}
                    </Text>
                    <Text preset="formHelper" size="xs" style={$workoutDescription}>
                      {getWorkoutSummary(savedWorkout.workoutPlan)}
                    </Text>
                    <View style={$workoutMeta}>
                      <View style={$metaItem}>
                        {savedWorkout.location === "indoor" ? (
                          <HomeIcon size={12} color={colors.palette.secondary500} />
                        ) : (
                          <SunIcon size={12} color={colors.palette.accent500} />
                        )}
                        <Text preset="formHelper" size="xxs" style={$metaText}>
                          {savedWorkout.location === "indoor" ? "Indoor" : "Outdoor"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={$deleteButton}
                    onPress={() => handleDeleteWorkout(savedWorkout.id)}
                  >
                    <TrashIcon size={16} color={colors.palette.neutral100} />
                  </TouchableOpacity>
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

// Loading State
const $loadingContainer: ViewStyle = {
  gap: 16,
}

const $skeletonCard: ViewStyle = {
  backgroundColor: colors.background,
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
}

const $skeletonHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
}

const $skeletonTitle: ViewStyle = {
  height: 24,
  width: "70%",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
}

const $skeletonDelete: ViewStyle = {
  width: 40,
  height: 40,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 20,
}

const $skeletonStats: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 16,
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
}

const $skeletonStat: ViewStyle = {
  height: 40,
  width: "30%",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
}

const $skeletonButton: ViewStyle = {
  height: 56,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
}

// Empty State
const $emptyState: ViewStyle = {
  alignItems: "center",
  paddingVertical: 80,
  paddingHorizontal: 40,
}

const $emptyIconContainer: ViewStyle = {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: colors.palette.primary100,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 32,
  borderWidth: 3,
  borderColor: colors.palette.primary200,
  shadowColor: colors.palette.primary500,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 2,
}

const $emptyDescription: TextStyle = {
  textAlign: "center",
  lineHeight: 24,
  marginBottom: 24,
}

const $emptyAction: ViewStyle = {
  paddingHorizontal: 20,
  paddingVertical: 12,
  backgroundColor: colors.palette.accent100,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.palette.accent200,
}

const $emptyActionText: TextStyle = {
  textAlign: "center",
  color: colors.textDim,
}

// Workouts List
const $workoutsList: ViewStyle = {
  gap: 16,
}

const $workoutCard: ViewStyle = {
  padding: 16,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: colors.border,
  marginBottom: 12,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
}

const $workoutHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginBottom: 12,
}

const $workoutInfo: ViewStyle = {
  flex: 1,
  marginRight: 16,
}

const $workoutName: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
}

const $workoutDescription: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
  marginBottom: 6,
  lineHeight: 16,
}

const $workoutMeta: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $metaItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
}

const $metaText: TextStyle = {
  fontSize: 10,
  color: colors.textDim,
  fontWeight: "500",
}

const $workoutPreview: ViewStyle = {
  marginTop: 12,
}

const $previewButton: ViewStyle = {
  height: 56,
  borderRadius: 12,
}

const $deleteButton: ViewStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.palette.angry500,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: colors.palette.angry500,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 2,
}
