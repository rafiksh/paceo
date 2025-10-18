import { FC, useState } from "react"
import { View, ViewStyle, TouchableOpacity, ScrollView } from "react-native"
import type { TextStyle } from "react-native"
import type { IntervalBlock, IntervalStep } from "expo-workoutkit"
import { TrashIcon } from "react-native-heroicons/solid"

import { AlertDisplay } from "@/components/AlertDisplay"
import { GoalSelector } from "@/components/GoalSelector"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

interface IntervalBlockBuilderProps {
  block: IntervalBlock
  onBlockChange: (block: IntervalBlock) => void
  onDelete: () => void
}

export const IntervalBlockBuilder: FC<IntervalBlockBuilderProps> = ({
  block,
  onBlockChange,
  onDelete,
}) => {
  const [iterations, setIterations] = useState(block.iterations.toString())

  const handleIterationsChange = (value: string) => {
    setIterations(value)
    onBlockChange({
      ...block,
      iterations: parseInt(value) || 1,
    })
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
      <View style={$header}>
        <Text style={$title}>Interval Block</Text>
        <TouchableOpacity style={$deleteButton} onPress={onDelete}>
          <TrashIcon size={18} color={colors.error} />
        </TouchableOpacity>
      </View>

      <Text style={$label}>Iterations</Text>
      <TextField
        placeholder="Number of iterations"
        value={iterations}
        onChangeText={handleIterationsChange}
        keyboardType="numeric"
      />

      <Text style={$label}>Steps</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={$stepsContainer}>
        {block.steps.map((step, index) => (
          <View key={index} style={$stepCard}>
            <View style={$stepHeader}>
              <Text style={$stepTitle}>Step {index + 1}</Text>
              {block.steps.length > 1 && (
                <TouchableOpacity onPress={() => removeStep(index)}>
                  <Text style={$removeStepText}>❌</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={$label}>Purpose</Text>
            <View style={$purposeGrid}>
              <TouchableOpacity
                style={[$purposeButton, step.purpose === "work" && $purposeButtonSelected]}
                onPress={() => handleStepChange(index, { ...step, purpose: "work" })}
              >
                <Text style={[$purposeText, step.purpose === "work" && $purposeTextSelected]}>
                  Work
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[$purposeButton, step.purpose === "recovery" && $purposeButtonSelected]}
                onPress={() => handleStepChange(index, { ...step, purpose: "recovery" })}
              >
                <Text style={[$purposeText, step.purpose === "recovery" && $purposeTextSelected]}>
                  Recovery
                </Text>
              </TouchableOpacity>
            </View>

            <GoalSelector
              goal={step.step.goal}
              onGoalChange={(goal) =>
                handleStepChange(index, {
                  ...step,
                  step: { ...step.step, goal },
                })
              }
            />

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
      </ScrollView>

      <TouchableOpacity style={$addStepButton} onPress={addStep}>
        <Text style={$addStepText}>+ Add Step</Text>
      </TouchableOpacity>
    </View>
  )
}

// Styles
const $container: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 16,
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
}

const $title: TextStyle = {
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  fontFamily: typography.primary.bold,
}

const $deleteButton: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  padding: 12,
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
}

const $label: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 8,
  marginTop: 16,
}

const $stepsContainer: ViewStyle = {
  marginBottom: 16,
}

const $stepCard: ViewStyle = {
  width: 280,
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: 16,
  marginRight: 12,
  borderWidth: 1,
  borderColor: colors.border,
}

const $stepHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
}

const $stepTitle: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $removeStepText: TextStyle = {
  fontSize: 16,
  color: colors.error,
}

const $purposeGrid: ViewStyle = {
  flexDirection: "row",
  gap: 8,
  marginBottom: 12,
}

const $purposeButton: ViewStyle = {
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: colors.background,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
}

const $purposeButtonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $purposeText: TextStyle = {
  fontSize: 12,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $purposeTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $addStepButton: ViewStyle = {
  backgroundColor: colors.tint,
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  alignItems: "center",
}

const $addStepText: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.palette.neutral100,
  fontFamily: typography.primary.semiBold,
}
