import { FC } from "react"
import { View, ViewStyle } from "react-native"
import type { TextStyle } from "react-native"
import type { IntervalBlock, IntervalStep } from "expo-workoutkit"
import { TrashIcon, PlusIcon } from "react-native-heroicons/solid"

import { AlertDisplay } from "@/components/AlertDisplay"
import { Button } from "@/components/Button"
import { GoalSelector } from "@/components/GoalSelector"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface IntervalBlockBuilderProps {
  block: IntervalBlock
  index: number
  onBlockChange: (block: IntervalBlock) => void
  onDelete: () => void
}

export const IntervalBlockBuilder: FC<IntervalBlockBuilderProps> = ({
  block,
  index,
  onBlockChange,
  onDelete,
}) => {
  const { themed } = useAppTheme()
  const handleIterationsChange = (newIterations: number) => {
    onBlockChange({
      ...block,
      iterations: newIterations,
    })
  }

  const incrementIterations = () => {
    handleIterationsChange(block.iterations + 1)
  }

  const decrementIterations = () => {
    if (block.iterations > 1) {
      handleIterationsChange(block.iterations - 1)
    }
  }

  const handleStepChange = (stepIndex: number, step: IntervalStep) => {
    const newSteps = [...block.steps]
    newSteps[stepIndex] = step
    onBlockChange({
      ...block,
      steps: newSteps,
    })
  }

  const addStep = () => {
    const newStep: IntervalStep = {
      purpose: "work",
      step: {
        goal: {
          type: "time",
          value: 1,
          unit: "minutes",
        },
      },
    }
    onBlockChange({
      ...block,
      steps: [...block.steps, newStep],
    })
  }

  const removeStep = (stepIndex: number) => {
    if (block.steps.length > 1) {
      const newSteps = block.steps.filter((_, index) => index !== stepIndex)
      onBlockChange({
        ...block,
        steps: newSteps,
      })
    }
  }

  return (
    <View style={themed($container)}>
      <View style={themed($subHeader)}>
        <Text preset="subheading">Block {index + 1}</Text>
        <Button onPress={onDelete} preset="ghost">
          <TrashIcon size={16} color={themed($trashIconColor)} />
        </Button>
      </View>
      <View style={themed($iterationsRow)}>
        <Text preset="formLabel">Repetitions</Text>
        <View style={themed($iterationsStepper)}>
          <Button
            style={[
              themed($stepperButton),
              block.iterations <= 1 && themed($stepperButtonDisabled),
            ]}
            onPress={decrementIterations}
            disabled={block.iterations <= 1}
            preset="ghost"
          >
            <Text style={themed($stepperText)}>−</Text>
          </Button>
          <Text preset="formLabel" style={themed($stepperValue)}>
            {block.iterations}
          </Text>
          <Button style={themed($stepperButton)} onPress={incrementIterations} preset="ghost">
            <Text style={themed($stepperText)}>+</Text>
          </Button>
        </View>
      </View>

      {block.steps.length === 0 && (
        <View style={themed($emptyStepsContainer)}>
          <Text preset="formHelper" style={themed($emptyStepsText)}>
            No steps added yet. Tap &quot;Add Step&quot; to get started.
          </Text>
        </View>
      )}

      {block.steps.length > 0 && (
        <View style={themed($stepsContainer)}>
          {block.steps.map((step, index) => (
            <View key={index} style={themed($stepCard)}>
              <View style={themed($subHeader)}>
                <Text preset="subheading">Step {index + 1}</Text>
                {block.steps.length > 1 && (
                  <Button onPress={() => removeStep(index)} preset="ghost">
                    <TrashIcon size={16} color={themed($trashIconColor)} />
                  </Button>
                )}
              </View>

              <Text preset="formLabel">Purpose</Text>
              <View style={themed($purposeGrid)}>
                <Button
                  text="Work"
                  onPress={() => handleStepChange(index, { ...step, purpose: "work" })}
                  preset={step.purpose === "work" ? "primary" : "default"}
                />
                <Button
                  text="Recovery"
                  onPress={() => handleStepChange(index, { ...step, purpose: "recovery" })}
                  preset={step.purpose === "recovery" ? "primary" : "default"}
                />
              </View>

              <GoalSelector
                goal={step.step.goal}
                type="embedded"
                onGoalChange={(goal) =>
                  handleStepChange(index, {
                    ...step,
                    step: { ...step.step, goal },
                  })
                }
              />
              <View style={themed($separator)} />

              <AlertDisplay
                alert={step.step.alert}
                onAlertChange={(alert) =>
                  handleStepChange(index, {
                    ...step,
                    step: { ...step.step, alert },
                  })
                }
              />
            </View>
          ))}
        </View>
      )}

      <Button
        text="Add Step"
        LeftAccessory={() => <PlusIcon size={16} color={themed($plusIconColor)} />}
        onPress={addStep}
        preset="primary"
      />
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: spacing.md,
})

const $iterationsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.md,
})

const $iterationsStepper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: colors.border,
})

const $stepperButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 28,
  height: 28,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
})

const $stepperButtonDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  borderColor: colors.palette.neutral400,
})

const $stepperText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
})

const $stepperValue: ThemedStyle<TextStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  minWidth: 24,
  textAlign: "center",
})

const $stepsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $emptyStepsContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  padding: spacing.md,
  marginBottom: spacing.md,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.border,
  borderStyle: "dashed",
})

const $emptyStepsText: ThemedStyle<TextStyle> = ({ colors }) => ({
  textAlign: "center",
  color: colors.textDim,
})

const $stepCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
})

const $subHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $purposeGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
  marginBottom: spacing.sm,
})

const $separator: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.sm,
})

const $trashIconColor: ThemedStyle<string> = ({ colors }) => colors.error

const $plusIconColor: ThemedStyle<string> = ({ colors }) => colors.background
