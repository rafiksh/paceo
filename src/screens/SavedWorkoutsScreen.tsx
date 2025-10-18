import { FC, useState, useEffect } from "react"
import { View, ViewStyle, ScrollView, TouchableOpacity, Alert } from "react-native"
import type { TextStyle } from "react-native"
import { router } from "expo-router"
import { PreviewWorkoutButton } from "expo-workoutkit"
import { TrashIcon, HeartIcon, HomeIcon, SunIcon, EyeIcon } from "react-native-heroicons/outline"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"

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

  const handlePreviewWorkout = (workout: SavedWorkout) => {
    // Navigate to workout preview screen as modal
    router.push({
      pathname: "/(tabs)/saved/preview",
      params: { workoutId: workout.id },
    })
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
            setSavedWorkouts((prev) => prev.filter((workout) => workout.id !== id))
          } catch (error) {
            console.error("Error deleting workout:", error)
            Alert.alert("Error", "Failed to delete workout")
          }
        },
      },
    ])
  }

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
        <View style={$header}>
          <Text preset="heading">Saved Workouts</Text>
          <Text preset="subheading">Your saved workout plans</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={$skeletonCard}>
              <View style={$skeletonContent}>
                <View style={$skeletonTitle} />
                <View style={$skeletonDescription} />
                <View style={$skeletonMeta} />
              </View>
              <View style={$skeletonButton} />
            </View>
          ))}
        </ScrollView>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <View style={$header}>
        <Text preset="heading">Saved Workouts</Text>
        <Text preset="subheading">Your saved workout plans</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        {savedWorkouts.length === 0 ? (
          <View style={$emptyState}>
            <View style={$emptyIconContainer}>
              <HeartIcon size={40} color={colors.palette.neutral400} />
            </View>
            <Text preset="heading" size="md" style={$emptyTitle}>
              No Saved Workouts
            </Text>
            <Text preset="formHelper" style={$emptyDescription}>
              Create your first workout to see it here
            </Text>
          </View>
        ) : (
          <View style={$workoutsList}>
            {savedWorkouts.map((savedWorkout) => (
              <View key={savedWorkout.id}>
                <View style={$workoutCard}>
                  {/* Workout Info */}
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

                  {/* Action Buttons */}
                  <View style={$actionButtons}>
                    <TouchableOpacity
                      style={$previewIconButton}
                      onPress={() => handlePreviewWorkout(savedWorkout)}
                    >
                      <EyeIcon size={16} color={colors.palette.neutral100} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={$deleteButton}
                      onPress={() => handleDeleteWorkout(savedWorkout.id)}
                    >
                      <TrashIcon size={16} color={colors.palette.neutral100} />
                    </TouchableOpacity>
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
                    style={$startWorkoutButton}
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
}

const $scrollContent: ViewStyle = {
  paddingVertical: 40,
  paddingHorizontal: 24,
}

const $header: ViewStyle = {
  paddingHorizontal: 24,
}

const $workoutsList: ViewStyle = {
  paddingVertical: 20,
  gap: 16,
}

const $workoutCard: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.palette.neutral100,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
}

const $workoutInfo: ViewStyle = {
  flex: 1,
  marginRight: 12,
}

const $workoutName: TextStyle = {
  color: colors.text,
  marginBottom: 4,
}

const $workoutDescription: TextStyle = {
  color: colors.textDim,
  marginBottom: 8,
}

const $workoutMeta: ViewStyle = {
  flexDirection: "row",
  gap: 12,
}

const $metaItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
}

const $metaText: TextStyle = {
  color: colors.textDim,
}

const $actionButtons: ViewStyle = {
  flexDirection: "row",
  gap: 8,
}

const $previewIconButton: ViewStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.tint,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: colors.tint,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 2,
}

const $startWorkoutButton: ViewStyle = {
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

const $workoutPreview: ViewStyle = {
  marginTop: 12,
}

// Loading States
const $skeletonCard: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.palette.neutral100,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 16,
}

const $skeletonContent: ViewStyle = {
  flex: 1,
  marginRight: 12,
}

const $skeletonTitle: ViewStyle = {
  height: 16,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  marginBottom: 8,
  width: "60%",
}

const $skeletonDescription: ViewStyle = {
  height: 12,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  marginBottom: 8,
  width: "80%",
}

const $skeletonMeta: ViewStyle = {
  height: 10,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  width: "40%",
}

const $skeletonButton: ViewStyle = {
  height: 32,
  width: 32,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
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
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 24,
}

const $emptyTitle: TextStyle = {
  color: colors.text,
  marginBottom: 8,
  textAlign: "center",
}

const $emptyDescription: TextStyle = {
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 20,
}
