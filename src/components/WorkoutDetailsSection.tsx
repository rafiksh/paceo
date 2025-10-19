import { FC } from "react"
import { View, ViewStyle } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
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
  const { themed } = useAppTheme()
  // Helper function to render steps
  const renderSteps = (block: unknown) => {
    const blockObj = block as Record<string, unknown>
    const steps = blockObj.steps as unknown[] | undefined
    return steps?.map((step: unknown, stepIndex: number) => {
      const stepDisplay = getStepDisplay(step)
      return (
        <View key={stepIndex} style={themed($stepCard)}>
          <View style={themed($stepContent)}>
            <Text preset="formLabel" size="sm" style={themed($stepDuration)}>
              {stepDisplay.duration}
            </Text>
            <Text preset="formHelper" size="xs" style={themed($stepPurpose)}>
              {stepDisplay.purpose}
            </Text>
          </View>

          {stepDisplay.alerts.length > 0 && (
            <View style={themed($stepAlerts)}>
              {stepDisplay.alerts.map((alert, alertIndex) => (
                <View key={alertIndex} style={themed($alertBadge)}>
                  <Text preset="formHelper" size="xs" style={themed($alertText)}>
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
    <View style={themed($detailSection)}>
      <Text preset="subheading" style={themed($sectionTitle)}>
        Goal Details
      </Text>
      <View style={themed($goalCard)}>
        <Text preset="heading" size="xl" style={themed($goalValue)}>
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
        <Text preset="formHelper" style={themed($goalType)}>
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
    <View style={themed($detailSection)}>
      <Text preset="subheading" style={themed($sectionTitle)}>
        Pace Details
      </Text>
      <View style={themed($pacerCard)}>
        <View style={themed($pacerRow)}>
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
        <View style={themed($pacerRow)}>
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
        <View style={themed($pacerRow)}>
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

    return (
      <View style={themed($detailSection)}>
        <Text preset="subheading" style={themed($sectionTitle)}>
          Workout Segments
        </Text>

        {/* Warmup */}
        {customWorkout?.warmup && (
          <View style={themed($blockCard)}>
            <View style={themed($blockHeader)}>
              <View style={themed($blockTitleContainer)}>
                <Text preset="heading" size="md" style={themed($blockTitle)}>
                  Warmup
                </Text>
              </View>
            </View>
            <View style={themed($stepCard)}>
              <View style={themed($stepContent)}>
                <Text preset="formLabel" size="sm" style={themed($stepDuration)}>
                  {getGoalDisplay(customWorkout.warmup?.goal)}
                </Text>
                <Text preset="formHelper" size="xs" style={themed($stepPurpose)}>
                  Preparation phase
                </Text>
              </View>
              {customWorkout.warmup?.alert && (
                <View style={themed($stepAlerts)}>
                  <View style={themed($alertBadge)}>
                    <Text preset="formHelper" size="xs" style={themed($alertText)}>
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
            <View key={blockIndex} style={themed($blockCard)}>
              {/* Block Header */}
              <View style={themed($blockHeader)}>
                <View style={themed($blockTitleContainer)}>
                  <Text preset="heading" size="md" style={themed($blockTitle)}>
                    Block {blockIndex + 1}
                  </Text>
                  <View style={themed($blockBadge)}>
                    <Text preset="formLabel" size="xs" style={themed($blockBadgeText)}>
                      {blockSummary.iterations}x
                    </Text>
                  </View>
                </View>
                <Text preset="formHelper" style={themed($blockDescription)}>
                  {blockSummary.totalSteps} step{blockSummary.totalSteps !== 1 ? "s" : ""} •{" "}
                  {blockSummary.stepTypes.join(", ")}
                </Text>
              </View>

              {/* Steps */}
              <View style={themed($stepsContainer)}>{renderSteps(block)}</View>
            </View>
          )
        })}

        {/* Cooldown */}
        {customWorkout?.cooldown && (
          <View style={themed($blockCard)}>
            <View style={themed($blockHeader)}>
              <View style={themed($blockTitleContainer)}>
                <Text preset="heading" size="md" style={themed($blockTitle)}>
                  Cooldown
                </Text>
              </View>
            </View>
            <View style={themed($stepCard)}>
              <View style={themed($stepContent)}>
                <Text preset="formLabel" size="sm" style={themed($stepDuration)}>
                  {getGoalDisplay(customWorkout.cooldown?.goal)}
                </Text>
                <Text preset="formHelper" size="xs" style={themed($stepPurpose)}>
                  Recovery phase
                </Text>
              </View>
              {customWorkout.cooldown?.alert && (
                <View style={themed($stepAlerts)}>
                  <View style={themed($alertBadge)}>
                    <Text preset="formHelper" size="xs" style={themed($alertText)}>
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
          <View style={themed($blockCard)}>
            <Text preset="heading" size="md" style={themed($blockTitle)}>
              No Workout Data
            </Text>
            <Text preset="formHelper" style={themed($blockDescription)}>
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
const $detailSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginBottom: spacing.sm,
  color: colors.text,
})

const $goalCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.accent100,
  padding: spacing.lg,
  borderRadius: 12,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.palette.accent200,
})

const $goalValue: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xs,
})

const $goalType: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $pacerCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.secondary100,
  padding: spacing.md,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.secondary200,
})

const $pacerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.xs,
})

const $blockCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: 16,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
})

const $blockHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $blockTitleContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.xs,
})

const $blockTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
})

const $blockBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingHorizontal: spacing.xs,
  paddingVertical: 4,
  borderRadius: 12,
})

const $blockBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontWeight: "600",
})

const $blockDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
})

const $stepsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $stepCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  flex: 1,
})

const $stepContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $stepDuration: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "600",
  fontSize: 16,
  marginBottom: 4,
})

const $stepPurpose: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
  textTransform: "capitalize",
})

const $stepAlerts: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 6,
})

const $alertBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral300,
  paddingHorizontal: spacing.xs,
  paddingVertical: 4,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: colors.palette.neutral400,
})

const $alertText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 11,
  fontWeight: "500",
})
