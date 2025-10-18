import { FC } from "react"
import { View, ViewStyle } from "react-native"
import type { TextStyle } from "react-native"
import type { IntervalBlock, IntervalStep } from "expo-workoutkit"
import { TrashIcon, PlusIcon } from "react-native-heroicons/solid"

import { AlertDisplay } from "@/components/AlertDisplay"
import { Button } from "@/components/Button"
import { GoalSelector } from "@/components/GoalSelector"
import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"

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
    <View style={$container}>
      <View style={$subHeader}>
        <Text preset="subheading">Block {index + 1}</Text>
        <Button onPress={onDelete} preset="ghost">
          <TrashIcon size={16} color={colors.error} />
        </Button>
      </View>
      <View style={$iterationsRow}>
        <Text preset="formLabel">Repetitions</Text>
        <View style={$iterationsStepper}>
          <Button
            style={[$stepperButton, block.iterations <= 1 && $stepperButtonDisabled]}
            onPress={decrementIterations}
            disabled={block.iterations <= 1}
            preset="ghost"
          >
            <Text style={$stepperText}>−</Text>
          </Button>
          <Text preset="formLabel" style={$stepperValue}>
            {block.iterations}
          </Text>
          <Button style={$stepperButton} onPress={incrementIterations} preset="ghost">
            <Text style={$stepperText}>+</Text>
          </Button>
        </View>
      </View>

      {block.steps.length === 0 && (
        <View style={$emptyStepsContainer}>
          <Text preset="formHelper" style={$emptyStepsText}>
            No steps added yet. Tap &quot;Add Step&quot; to get started.
          </Text>
        </View>
      )}

      {block.steps.length > 0 && (
        <View style={$stepsContainer}>
          {block.steps.map((step, index) => (
            <View key={index} style={$stepCard}>
              <View style={$subHeader}>
                <Text preset="subheading">Step {index + 1}</Text>
                {block.steps.length > 1 && (
                  <Button onPress={() => removeStep(index)} preset="ghost">
                    <TrashIcon size={16} color={colors.error} />
                  </Button>
                )}
              </View>

              <Text preset="formLabel">Purpose</Text>
              <View style={$purposeGrid}>
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
              <View style={$separator} />

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
        LeftAccessory={() => <PlusIcon size={16} color={colors.background} />}
        onPress={addStep}
        preset="primary"
      />
    </View>
  )
}

// Styles
const $container: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 16,
}

const $iterationsRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
}

const $iterationsStepper: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: colors.border,
}

const $stepperButton: ViewStyle = {
  width: 28,
  height: 28,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
}

const $stepperButtonDisabled: ViewStyle = {
  backgroundColor: colors.palette.neutral300,
  borderColor: colors.palette.neutral400,
}

const $stepperText: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
}

const $stepperValue: TextStyle = {
  paddingHorizontal: 12,
  minWidth: 24,
  textAlign: "center",
}

const $stepsContainer: ViewStyle = {
  marginBottom: 16,
}

const $emptyStepsContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.border,
  borderStyle: "dashed",
}

const $emptyStepsText: TextStyle = {
  textAlign: "center",
  color: colors.textDim,
}

const $stepCard: ViewStyle = {
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
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
}

const $subHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
}

const $purposeGrid: ViewStyle = {
  flexDirection: "row",
  gap: 8,
  marginBottom: 12,
}

const $separator: ViewStyle = {
  marginVertical: 12,
}
