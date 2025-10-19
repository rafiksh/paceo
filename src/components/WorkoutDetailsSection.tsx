import { FC } from "react"
import { View, ViewStyle } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"
import {
  isCustomWorkout,
  isSingleGoalWorkout,
  getGoalDisplay,
  getAlertDisplay,
  getStepDisplay,
  getBlockSummary,
} from "@/utils/workoutUtils"

// Type definitions for better type safety
interface WorkoutGoal {
  type: string
  value?: number
  unit?: string
}

interface WorkoutDistance {
  value?: number
  unit?: string
}

interface WorkoutTime {
  value?: number
  unit?: string
}

interface WorkoutDetailsSectionProps {
  workoutType: "goal" | "pacer" | "custom"
  workout: unknown
}

export const WorkoutDetailsSection: FC<WorkoutDetailsSectionProps> = ({ workoutType, workout }) => {
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

  const renderGoalWorkout = () => (
    <View style={$detailSection}>
      <Text preset="subheading" style={$sectionTitle}>
        Goal Details
      </Text>
      <View style={$goalCard}>
        <Text preset="heading" size="xl" style={$goalValue}>
          {workout && typeof workout === "object" && "goal" in workout
            ? (() => {
                const goalObj = (workout as Record<string, unknown>).goal as WorkoutGoal
                if (goalObj?.type === "open") {
                  return "Open Goal"
                }
                if (isSingleGoalWorkout(workout)) {
                  const goal = workout.goal as WorkoutGoal
                  return `${goal?.value || "Open"} ${goal?.unit || ""}`
                }
                return "Open goal"
              })()
            : "No goal set"}
        </Text>
        <Text preset="formHelper" style={$goalType}>
          {workout && typeof workout === "object" && "goal" in workout
            ? (() => {
                const goal = (workout as Record<string, unknown>).goal as WorkoutGoal
                switch (goal?.type) {
                  case "time":
                    return "Time-based goal"
                  case "distance":
                    return "Distance-based goal"
                  case "energy":
                    return "Energy-based goal"
                  case "open":
                    return "Open-ended goal"
                  default:
                    return "Unknown goal type"
                }
              })()
            : "No goal type"}
        </Text>
      </View>
    </View>
  )

  const renderPacerWorkout = () => (
    <View style={$detailSection}>
      <Text preset="subheading" style={$sectionTitle}>
        Pace Details
      </Text>
      <View style={$pacerCard}>
        <View style={$pacerRow}>
          <Text preset="formLabel">Distance</Text>
          <Text preset="heading" size="md">
            {workout && typeof workout === "object" && "distance" in workout
              ? (() => {
                  const distance = (workout as Record<string, unknown>).distance as WorkoutDistance
                  return `${distance?.value || 0} ${distance?.unit || ""}`
                })()
              : "No distance set"}
          </Text>
        </View>
        <View style={$pacerRow}>
          <Text preset="formLabel">Time Target</Text>
          <Text preset="heading" size="md">
            {workout && typeof workout === "object" && "time" in workout
              ? (() => {
                  const time = (workout as Record<string, unknown>).time as WorkoutTime
                  return `${time?.value || 0} ${time?.unit || ""}`
                })()
              : "No time set"}
          </Text>
        </View>
        <View style={$pacerRow}>
          <Text preset="formLabel">Required Pace</Text>
          <Text preset="heading" size="md">
            {workout && typeof workout === "object" && "distance" in workout && "time" in workout
              ? (() => {
                  const distance = (workout as Record<string, unknown>).distance as Record<
                    string,
                    unknown
                  >
                  const time = (workout as Record<string, unknown>).time as Record<string, unknown>
                  const distanceValue = Number(distance?.value) || 0
                  const timeValue = Number(time?.value) || 1
                  return `${(distanceValue / timeValue).toFixed(2)} ${distance?.unit || ""}/${time?.unit || ""}`
                })()
              : "Cannot calculate pace"}
          </Text>
        </View>
      </View>
    </View>
  )

  const renderCustomWorkout = () => {
    const customWorkout = isCustomWorkout(workout) ? workout : null
    const warmupGoal = customWorkout ? getGoalDisplay(customWorkout.warmup?.goal) : "No warmup"

    return (
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
            Blocks: {customWorkout?.blocks?.length || 0}
          </Text>
          <Text preset="formHelper" style={$blockDescription}>
            Has Warmup: {customWorkout?.warmup ? "Yes" : "No"}
          </Text>
          <Text preset="formHelper" style={$blockDescription}>
            Has Cooldown: {customWorkout?.cooldown ? "Yes" : "No"}
          </Text>
          <Text preset="formHelper" style={$blockDescription}>
            Warmup Goal: {warmupGoal}
          </Text>
          <Text preset="formHelper" style={$blockDescription}>
            First Block Steps: {customWorkout?.blocks?.[0]?.steps?.length || 0}
          </Text>
          {customWorkout?.blocks?.[0] && (
            <Text preset="formHelper" style={$blockDescription}>
              First Block Summary: {JSON.stringify(getBlockSummary(customWorkout.blocks[0]))}
            </Text>
          )}
        </View>

        {/* Warmup */}
        {customWorkout?.warmup && (
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
                  {getGoalDisplay(customWorkout.warmup?.goal)}
                </Text>
                <Text preset="formHelper" size="xs" style={$stepPurpose}>
                  Preparation phase
                </Text>
              </View>
              {customWorkout.warmup?.alert && (
                <View style={$stepAlerts}>
                  <View style={$alertBadge}>
                    <Text preset="formHelper" size="xs" style={$alertText}>
                      {getAlertDisplay(customWorkout.warmup.alert)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Workout Blocks */}
        {customWorkout?.blocks?.map((block: unknown, blockIndex: number) => {
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
        {customWorkout?.cooldown && (
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
                  {getGoalDisplay(customWorkout.cooldown?.goal)}
                </Text>
                <Text preset="formHelper" size="xs" style={$stepPurpose}>
                  Recovery phase
                </Text>
              </View>
              {customWorkout.cooldown?.alert && (
                <View style={$stepAlerts}>
                  <View style={$alertBadge}>
                    <Text preset="formHelper" size="xs" style={$alertText}>
                      {getAlertDisplay(customWorkout.cooldown.alert)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Fallback when no data */}
        {!customWorkout?.blocks?.length && !customWorkout?.warmup && !customWorkout?.cooldown && (
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
    )
  }

  switch (workoutType) {
    case "goal":
      return renderGoalWorkout()
    case "pacer":
      return renderPacerWorkout()
    case "custom":
      return renderCustomWorkout()
    default:
      return null
  }
}

// Styles
const $detailSection: ViewStyle = {
  marginBottom: 24,
}

const $sectionTitle: TextStyle = {
  marginBottom: 12,
  color: colors.text,
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
