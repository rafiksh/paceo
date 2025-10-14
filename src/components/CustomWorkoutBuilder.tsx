import { FC, useState } from "react"
import { View, ViewStyle, TouchableOpacity, ScrollView } from "react-native"
import type { TextStyle } from "react-native"
import type { CustomWorkout, IntervalBlock, WorkoutStep } from "expo-workoutkit"

import { AlertSelector } from "@/components/AlertSelector"
import { GoalSelector } from "@/components/GoalSelector"
import { IntervalBlockBuilder } from "@/components/IntervalBlockBuilder"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

interface CustomWorkoutBuilderProps {
  workout: CustomWorkout | null
  onWorkoutChange: (workout: CustomWorkout) => void
}

export const CustomWorkoutBuilder: FC<CustomWorkoutBuilderProps> = ({
  workout,
  onWorkoutChange,
}) => {
  const [displayName, setDisplayName] = useState(workout?.displayName || "")

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value)
    onWorkoutChange({
      ...workout,
      displayName: value,
    })
  }

  const handleWarmupChange = (warmup: WorkoutStep | undefined) => {
    onWorkoutChange({
      ...workout,
      warmup,
    })
  }

  const handleBlockChange = (blockIndex: number, block: IntervalBlock) => {
    const newBlocks = [...(workout?.blocks || [])]
    newBlocks[blockIndex] = block
    onWorkoutChange({
      ...workout,
      blocks: newBlocks,
    })
  }

  const addBlock = () => {
    const newBlock: IntervalBlock = {
      steps: [
        {
          purpose: "work",
          step: {
            goal: {
              type: "time",
              value: 1,
              unit: "minutes",
            },
          },
        },
      ],
      iterations: 1,
    }
    onWorkoutChange({
      ...workout,
      blocks: [...(workout?.blocks || []), newBlock],
    })
  }

  const removeBlock = (blockIndex: number) => {
    if ((workout?.blocks?.length || 0) > 1) {
      const newBlocks = (workout?.blocks || []).filter((_, index) => index !== blockIndex)
      onWorkoutChange({
        ...workout,
        blocks: newBlocks,
      })
    }
  }

  const handleCooldownChange = (cooldown: WorkoutStep | undefined) => {
    onWorkoutChange({
      ...workout,
      cooldown,
    })
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={$container}>
      <Text style={$label}>Workout Name</Text>
      <TextField
        placeholder="Enter workout name"
        value={displayName}
        onChangeText={handleDisplayNameChange}
      />

      <Text style={$label}>Warmup (Optional)</Text>
      <View style={$section}>
        <TouchableOpacity
          style={[$toggleButton, workout?.warmup && $toggleButtonSelected]}
          onPress={() =>
            handleWarmupChange(
              workout?.warmup
                ? undefined
                : {
                    goal: {
                      type: "time",
                      value: 5,
                      unit: "minutes",
                    },
                  },
            )
          }
        >
          <Text style={[$toggleButtonText, workout?.warmup && $toggleButtonTextSelected]}>
            {workout?.warmup ? "Remove Warmup" : "Add Warmup"}
          </Text>
        </TouchableOpacity>

        {workout?.warmup && (
          <View style={$goalContainer}>
            <GoalSelector
              goal={workout.warmup.goal}
              onGoalChange={(goal) =>
                handleWarmupChange({
                  ...workout.warmup!,
                  goal,
                })
              }
            />
            <AlertSelector
              alert={workout.warmup.alert}
              onAlertChange={(alert) =>
                handleWarmupChange({
                  ...workout.warmup!,
                  alert,
                })
              }
            />
          </View>
        )}
      </View>

      <Text style={$label}>Interval Blocks</Text>
      {(workout?.blocks || []).map((block, index) => (
        <IntervalBlockBuilder
          key={index}
          block={block}
          onBlockChange={(updatedBlock) => handleBlockChange(index, updatedBlock)}
          onDelete={() => removeBlock(index)}
        />
      ))}

      <TouchableOpacity style={$addBlockButton} onPress={addBlock}>
        <Text style={$addBlockText}>+ Add Block</Text>
      </TouchableOpacity>

      <Text style={$label}>Cooldown (Optional)</Text>
      <View style={$section}>
        <TouchableOpacity
          style={[$toggleButton, workout?.cooldown && $toggleButtonSelected]}
          onPress={() =>
            handleCooldownChange(
              workout?.cooldown
                ? undefined
                : {
                    goal: {
                      type: "time",
                      value: 5,
                      unit: "minutes",
                    },
                  },
            )
          }
        >
          <Text style={[$toggleButtonText, workout?.cooldown && $toggleButtonTextSelected]}>
            {workout?.cooldown ? "Remove Cooldown" : "Add Cooldown"}
          </Text>
        </TouchableOpacity>

        {workout?.cooldown && (
          <View style={$goalContainer}>
            <GoalSelector
              goal={workout.cooldown.goal}
              onGoalChange={(goal) =>
                handleCooldownChange({
                  ...workout.cooldown!,
                  goal,
                })
              }
            />
            <AlertSelector
              alert={workout.cooldown.alert}
              onAlertChange={(alert) =>
                handleCooldownChange({
                  ...workout.cooldown!,
                  alert,
                })
              }
            />
          </View>
        )}
      </View>
    </ScrollView>
  )
}

// Styles
const $container: ViewStyle = {
  flex: 1,
}

const $label: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 12,
  marginTop: 20,
}

const $section: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 16,
}

const $toggleButton: ViewStyle = {
  backgroundColor: colors.background,
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.border,
}

const $toggleButtonSelected: ViewStyle = {
  backgroundColor: colors.error,
  borderColor: colors.error,
}

const $toggleButtonText: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $toggleButtonTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $goalContainer: ViewStyle = {
  marginTop: 16,
}

const $addBlockButton: ViewStyle = {
  backgroundColor: colors.tint,
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 20,
  alignItems: "center",
  marginBottom: 20,
}

const $addBlockText: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.palette.neutral100,
  fontFamily: typography.primary.semiBold,
}
