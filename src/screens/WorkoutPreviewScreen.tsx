import { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"
import type { CustomWorkout, SingleGoalWorkout } from "expo-workoutkit"
import { XMarkIcon, HomeIcon, SunIcon } from "react-native-heroicons/outline"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { type SavedWorkout } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"

interface WorkoutPreviewScreenProps {
  workout: SavedWorkout
  onClose: () => void
}

export const WorkoutPreviewScreen: FC<WorkoutPreviewScreenProps> = function WorkoutPreviewScreen({
  workout,
  onClose,
}) {
  const { workoutPlan } = workout

  // Type guards for workout types
  const isCustomWorkout = (workout: unknown): workout is CustomWorkout => {
    return Boolean(workout && typeof workout === "object" && "blocks" in workout)
  }

  const isSingleGoalWorkout = (workout: unknown): workout is SingleGoalWorkout => {
    return Boolean(workout && typeof workout === "object" && "goal" in workout)
  }

  // Helper functions for extracting workout data
  const getGoalDisplay = (goal: unknown): string => {
    if (!goal || typeof goal !== "object") return "No goal set"
    const goalObj = goal as Record<string, unknown>
    if (goalObj.type === "open") return "Open goal"
    return `${goalObj.value || 0} ${goalObj.unit || ""}`
  }

  const getAlertDisplay = (alert: unknown): string => {
    if (!alert || typeof alert !== "object") return ""
    const alertObj = alert as Record<string, unknown>
    const target = alertObj.target as Record<string, unknown> | undefined
    if (!target) return `${alertObj.type} alert`
    return `${alertObj.type} alert (${target.min}-${target.max} ${target.unit})`
  }

  const getStepDisplay = (
    step: unknown,
  ): { duration: string; purpose: string; alerts: string[] } => {
    if (!step || typeof step !== "object") {
      return { duration: "No duration", purpose: "Unknown", alerts: [] }
    }
    const stepObj = step as Record<string, unknown>
    const goal = stepObj.step ? (stepObj.step as Record<string, unknown>).goal : stepObj.goal
    const duration = getGoalDisplay(goal)
    const purpose = (stepObj.purpose as string) || "Unknown"
    const alerts =
      stepObj.step && (stepObj.step as Record<string, unknown>).alert
        ? [getAlertDisplay((stepObj.step as Record<string, unknown>).alert)]
        : []

    return { duration, purpose, alerts }
  }

  const getBlockSummary = (
    block: unknown,
  ): { iterations: number; totalSteps: number; stepTypes: string[] } => {
    if (!block || typeof block !== "object") {
      return { iterations: 0, totalSteps: 0, stepTypes: [] }
    }
    const blockObj = block as Record<string, unknown>
    const iterations = (blockObj.iterations as number) || 0
    const steps = (blockObj.steps as unknown[]) || []
    const totalSteps = steps.length
    const stepTypes = steps.map((step: unknown) => {
      if (step && typeof step === "object") {
        const stepObj = step as Record<string, unknown>
        return (stepObj.purpose as string) || "Unknown"
      }
      return "Unknown"
    })

    return { iterations, totalSteps, stepTypes }
  }

  const renderWorkoutDetails = () => {
    // Debug logging
    console.log("Workout Plan:", JSON.stringify(workoutPlan, null, 2))
    console.log("Workout Type:", workoutPlan.type)
    // Type-safe access to workout properties
    const workoutData = workoutPlan.workout
    if (workoutData && "blocks" in workoutData) {
      console.log("Workout Blocks:", workoutData.blocks)
    }
    if (workoutData && "warmup" in workoutData) {
      console.log("Workout Warmup:", workoutData.warmup)
    }
    if (workoutData && "cooldown" in workoutData) {
      console.log("Workout Cooldown:", workoutData.cooldown)
    }

    // Helper variables for complex expressions
    const warmupGoal = isCustomWorkout(workoutPlan.workout)
      ? getGoalDisplay(workoutPlan.workout.warmup?.goal)
      : "No warmup"

    // Helper function to render steps
    const renderSteps = (block: unknown) => {
      const blockObj = block as Record<string, unknown>
      const steps = blockObj.steps as unknown[] | undefined
      return steps?.map((step: unknown, stepIndex: number) => {
        const stepDisplay = getStepDisplay(step)
        return (
          <View key={stepIndex} style={$stepCard}>
            <View style={$stepContent}>
              <Text preset="formLabel" size="sm" style={$stepDuration}>
                {stepDisplay.duration}
              </Text>
              <Text preset="formHelper" size="xs" style={$stepPurpose}>
                {stepDisplay.purpose}
              </Text>
            </View>

            {stepDisplay.alerts.length > 0 && (
              <View style={$stepAlerts}>
                {stepDisplay.alerts.map((alert, alertIndex) => (
                  <View key={alertIndex} style={$alertBadge}>
                    <Text preset="formHelper" size="xs" style={$alertText}>
                      {alert}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )
      })
    }

    return (
      <>
        {/* Workout Type */}
        <View style={$detailSection}>
          <Text preset="subheading" style={$sectionTitle}>
            Workout Type
          </Text>
          <View style={$typeCard}>
            <Text preset="heading" size="md" style={$typeText}>
              {workoutPlan.type === "goal" && "Goal Workout"}
              {workoutPlan.type === "pacer" && "Pacer Workout"}
              {workoutPlan.type === "custom" && "Custom Workout"}
            </Text>
            <Text preset="formHelper" style={$typeDescription}>
              {workoutPlan.type === "goal" && "Set a specific target to achieve"}
              {workoutPlan.type === "pacer" && "Maintain consistent pace throughout"}
              {workoutPlan.type === "custom" && "Complex intervals with multiple segments"}
            </Text>
          </View>
        </View>

        {/* Goal Workout Details */}
        {workoutPlan.type === "goal" && (
          <View style={$detailSection}>
            <Text preset="subheading" style={$sectionTitle}>
              Goal Details
            </Text>
            <View style={$goalCard}>
              <Text preset="heading" size="xl" style={$goalValue}>
                {workoutPlan.workout?.goal?.type === "open"
                  ? "Open Goal"
                  : isSingleGoalWorkout(workoutPlan.workout)
                    ? `${workoutPlan.workout.goal?.value || "Open"} ${workoutPlan.workout.goal?.unit || ""}`
                    : "Open goal"}
              </Text>
              <Text preset="formHelper" style={$goalType}>
                {workoutPlan.workout?.goal?.type === "time" && "Time-based goal"}
                {workoutPlan.workout?.goal?.type === "distance" && "Distance-based goal"}
                {workoutPlan.workout?.goal?.type === "energy" && "Energy-based goal"}
                {workoutPlan.workout?.goal?.type === "open" && "Open-ended goal"}
              </Text>
            </View>
          </View>
        )}

        {/* Pacer Workout Details */}
        {workoutPlan.type === "pacer" && (
          <View style={$detailSection}>
            <Text preset="subheading" style={$sectionTitle}>
              Pace Details
            </Text>
            <View style={$pacerCard}>
              <View style={$pacerRow}>
                <Text preset="formLabel">Distance</Text>
                <Text preset="heading" size="md">
                  {workoutPlan.workout?.distance?.value} {workoutPlan.workout?.distance?.unit}
                </Text>
              </View>
              <View style={$pacerRow}>
                <Text preset="formLabel">Time Target</Text>
                <Text preset="heading" size="md">
                  {workoutPlan.workout?.time?.value} {workoutPlan.workout?.time?.unit}
                </Text>
              </View>
              <View style={$pacerRow}>
                <Text preset="formLabel">Required Pace</Text>
                <Text preset="heading" size="md">
                  {(
                    workoutPlan.workout?.distance?.value / workoutPlan.workout?.time?.value
                  ).toFixed(2)}{" "}
                  {workoutPlan.workout?.distance?.unit}/{workoutPlan.workout?.time?.unit}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Custom Workout Details */}
        {workoutPlan.type === "custom" && (
          <View style={$detailSection}>
            <Text preset="subheading" style={$sectionTitle}>
              Workout Segments
            </Text>

            {/* Debug Info */}
            <View style={$blockCard}>
              <Text preset="heading" size="sm" style={$blockTitle}>
                Debug Info
              </Text>
              <Text preset="formHelper" style={$blockDescription}>
                Blocks: {workoutPlan.workout?.blocks?.length || 0}
              </Text>
              <Text preset="formHelper" style={$blockDescription}>
                Has Warmup: {workoutPlan.workout?.warmup ? "Yes" : "No"}
              </Text>
              <Text preset="formHelper" style={$blockDescription}>
                Has Cooldown: {workoutPlan.workout?.cooldown ? "Yes" : "No"}
              </Text>
              <Text preset="formHelper" style={$blockDescription}>
                Warmup Goal: {warmupGoal}
              </Text>
              <Text preset="formHelper" style={$blockDescription}>
                First Block Steps: {workoutPlan.workout?.blocks?.[0]?.steps?.length || 0}
              </Text>
              {workoutPlan.workout?.blocks?.[0] && (
                <Text preset="formHelper" style={$blockDescription}>
                  First Block Summary:{" "}
                  {JSON.stringify(getBlockSummary(workoutPlan.workout.blocks[0]))}
                </Text>
              )}
            </View>

            {/* Warmup */}
            {workoutPlan.workout?.warmup && (
              <View style={$blockCard}>
                <View style={$blockHeader}>
                  <View style={$blockTitleContainer}>
                    <Text preset="heading" size="md" style={$blockTitle}>
                      Warmup
                    </Text>
                    <View style={$warmupBadge}>
                      <Text preset="formLabel" size="xs" style={$warmupBadgeText}>
                        PREP
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={$stepCard}>
                  <View style={$stepContent}>
                    <Text preset="formLabel" size="sm" style={$stepDuration}>
                      {isCustomWorkout(workoutPlan.workout)
                        ? getGoalDisplay(workoutPlan.workout.warmup?.goal)
                        : "No warmup goal"}
                    </Text>
                    <Text preset="formHelper" size="xs" style={$stepPurpose}>
                      Preparation phase
                    </Text>
                  </View>
                  {isCustomWorkout(workoutPlan.workout) && workoutPlan.workout.warmup?.alert && (
                    <View style={$stepAlerts}>
                      <View style={$alertBadge}>
                        <Text preset="formHelper" size="xs" style={$alertText}>
                          {isCustomWorkout(workoutPlan.workout)
                            ? getAlertDisplay(workoutPlan.workout.warmup?.alert)
                            : "No alert"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Workout Blocks */}
            {workoutPlan.workout?.blocks?.map((block: unknown, blockIndex: number) => {
              const blockSummary = getBlockSummary(block)
              return (
                <View key={blockIndex} style={$blockCard}>
                  {/* Block Header */}
                  <View style={$blockHeader}>
                    <View style={$blockTitleContainer}>
                      <Text preset="heading" size="md" style={$blockTitle}>
                        Block {blockIndex + 1}
                      </Text>
                      <View style={$blockBadge}>
                        <Text preset="formLabel" size="xs" style={$blockBadgeText}>
                          {blockSummary.iterations}x
                        </Text>
                      </View>
                    </View>
                    <Text preset="formHelper" style={$blockDescription}>
                      {blockSummary.totalSteps} step{blockSummary.totalSteps !== 1 ? "s" : ""} •{" "}
                      {blockSummary.stepTypes.join(", ")}
                    </Text>
                  </View>

                  {/* Steps */}
                  <View style={$stepsContainer}>{renderSteps(block)}</View>
                </View>
              )
            })}

            {/* Cooldown */}
            {workoutPlan.workout?.cooldown && (
              <View style={$blockCard}>
                <View style={$blockHeader}>
                  <View style={$blockTitleContainer}>
                    <Text preset="heading" size="md" style={$blockTitle}>
                      Cooldown
                    </Text>
                    <View style={$cooldownBadge}>
                      <Text preset="formLabel" size="xs" style={$cooldownBadgeText}>
                        COOL
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={$stepCard}>
                  <View style={$stepContent}>
                    <Text preset="formLabel" size="sm" style={$stepDuration}>
                      {isCustomWorkout(workoutPlan.workout)
                        ? getGoalDisplay(workoutPlan.workout.cooldown?.goal)
                        : "No cooldown goal"}
                    </Text>
                    <Text preset="formHelper" size="xs" style={$stepPurpose}>
                      Recovery phase
                    </Text>
                  </View>
                  {isCustomWorkout(workoutPlan.workout) && workoutPlan.workout.cooldown?.alert && (
                    <View style={$stepAlerts}>
                      <View style={$alertBadge}>
                        <Text preset="formHelper" size="xs" style={$alertText}>
                          {isCustomWorkout(workoutPlan.workout)
                            ? getAlertDisplay(workoutPlan.workout.cooldown?.alert)
                            : "No alert"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Fallback when no data */}
            {!workoutPlan.workout?.blocks?.length &&
              !workoutPlan.workout?.warmup &&
              !workoutPlan.workout?.cooldown && (
                <View style={$blockCard}>
                  <Text preset="heading" size="md" style={$blockTitle}>
                    No Workout Data
                  </Text>
                  <Text preset="formHelper" style={$blockDescription}>
                    This custom workout doesn&apos;t have detailed segments configured.
                  </Text>
                </View>
              )}
          </View>
        )}

        {/* Workout Info */}
        <View style={$detailSection}>
          <Text preset="subheading" style={$sectionTitle}>
            Workout Information
          </Text>
          <View style={$infoCard}>
            <View style={$infoRow}>
              <Text preset="formLabel">Activity</Text>
              <Text preset="heading" size="sm">
                {workout.activity.charAt(0).toUpperCase() + workout.activity.slice(1)}
              </Text>
            </View>
            <View style={$infoRow}>
              <Text preset="formLabel">Location</Text>
              <View style={$locationInfo}>
                {workout.location === "indoor" ? (
                  <HomeIcon size={16} color={colors.palette.secondary500} />
                ) : (
                  <SunIcon size={16} color={colors.palette.accent500} />
                )}
                <Text preset="heading" size="sm" style={$locationText}>
                  {workout.location === "indoor" ? "Indoor" : "Outdoor"}
                </Text>
              </View>
            </View>
            <View style={$infoRow}>
              <Text preset="formLabel">Created</Text>
              <Text preset="heading" size="sm">
                {workout.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </>
    )
  }

  return (
    <Screen
      style={$container}
      preset="scroll"
      safeAreaEdges={["top"]}
      contentContainerStyle={$contentContainer}
    >
      {/* Header */}
      <View style={$header}>
        <Text preset="heading" size="lg" style={$title}>
          {workout.name}
        </Text>
        <TouchableOpacity style={$closeButton} onPress={onClose}>
          <XMarkIcon size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={$workoutDetails}>{renderWorkoutDetails()}</View>
    </Screen>
  )
}

// Styles
const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $contentContainer: ViewStyle = {
  paddingBottom: 24,
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 24,
  paddingVertical: 20,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

const $title: TextStyle = {
  flex: 1,
  marginRight: 16,
}

const $closeButton: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
}

const $workoutDetails: ViewStyle = {
  paddingHorizontal: 24,
  paddingVertical: 24,
}

const $detailSection: ViewStyle = {
  marginBottom: 24,
}

const $sectionTitle: TextStyle = {
  marginBottom: 12,
  color: colors.text,
}

const $typeCard: ViewStyle = {
  backgroundColor: colors.palette.primary100,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.primary200,
}

const $typeText: TextStyle = {
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
}

const $typeDescription: TextStyle = {
  color: colors.textDim,
}

const $goalCard: ViewStyle = {
  backgroundColor: colors.palette.accent100,
  padding: 20,
  borderRadius: 12,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.palette.accent200,
}

const $goalValue: TextStyle = {
  color: colors.text,
  marginBottom: 8,
}

const $goalType: TextStyle = {
  color: colors.textDim,
}

const $pacerCard: ViewStyle = {
  backgroundColor: colors.palette.secondary100,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.secondary200,
}

const $pacerRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 8,
}

const $blockCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: 20,
  borderRadius: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
}

const $blockHeader: ViewStyle = {
  marginBottom: 16,
}

const $blockTitleContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
}

const $blockTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
}

const $blockBadge: ViewStyle = {
  backgroundColor: colors.tint,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
}

const $blockBadgeText: TextStyle = {
  color: colors.palette.neutral100,
  fontWeight: "600",
}

const $blockDescription: TextStyle = {
  color: colors.textDim,
  fontSize: 14,
}

const $stepsContainer: ViewStyle = {
  gap: 16,
}

const $stepCard: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
  flex: 1,
}

const $stepContent: ViewStyle = {
  marginBottom: 8,
}

const $stepDuration: TextStyle = {
  color: colors.text,
  fontWeight: "600",
  fontSize: 16,
  marginBottom: 4,
}

const $stepPurpose: TextStyle = {
  color: colors.textDim,
  fontSize: 12,
  textTransform: "capitalize",
}

const $stepAlerts: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 6,
}

const $alertBadge: ViewStyle = {
  backgroundColor: colors.palette.neutral300,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: colors.palette.neutral400,
}

const $alertText: TextStyle = {
  color: colors.text,
  fontSize: 11,
  fontWeight: "500",
}

const $warmupBadge: ViewStyle = {
  backgroundColor: colors.palette.accent500,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
}

const $warmupBadgeText: TextStyle = {
  color: colors.palette.neutral100,
  fontWeight: "600",
}

const $cooldownBadge: ViewStyle = {
  backgroundColor: colors.palette.secondary500,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
}

const $cooldownBadgeText: TextStyle = {
  color: colors.palette.neutral100,
  fontWeight: "600",
}

const $infoCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
}

const $infoRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 8,
}

const $locationInfo: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
}

const $locationText: TextStyle = {
  color: colors.textDim,
}
