import { FC } from "react"
import { View, ViewStyle, TouchableOpacity, ScrollView } from "react-native"
import type { TextStyle } from "react-native"
import type { CustomWorkout, IntervalBlock, WorkoutStep } from "expo-workoutkit"
import { TrashIcon } from "react-native-heroicons/solid"

import { AlertDisplay } from "@/components/AlertDisplay"
import { GoalSelector } from "@/components/GoalSelector"
import { IntervalBlockBuilder } from "@/components/IntervalBlockBuilder"
import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"

interface CustomWorkoutBuilderProps {
  workout: CustomWorkout | null
  onWorkoutChange: (workout: CustomWorkout) => void
}

export const CustomWorkoutBuilder: FC<CustomWorkoutBuilderProps> = ({
  workout,
  onWorkoutChange,
}) => {
  const createInitialWorkout = (overrides: Partial<CustomWorkout> = {}) => ({
    activity: "running" as const,
    location: "outdoor" as const,
    displayName: "Custom Workout",
    blocks: [],
    ...overrides,
  })
  const handleWarmupChange = (warmup: WorkoutStep | undefined) => {
    if (!workout) {
      onWorkoutChange(createInitialWorkout({ warmup }))
      return
    }
    onWorkoutChange({
      ...workout,
      warmup,
    })
  }

  const handleBlockChange = (blockIndex: number, block: IntervalBlock) => {
    if (!workout) return
    const newBlocks = [...(workout.blocks || [])]
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

    if (!workout) {
      onWorkoutChange(createInitialWorkout({ blocks: [newBlock] }))
    } else {
      onWorkoutChange({
        ...workout,
        blocks: [...(workout.blocks || []), newBlock],
      })
    }
  }

  const removeBlock = (blockIndex: number) => {
    if (!workout) return
    const newBlocks = (workout.blocks || []).filter((_, index) => index !== blockIndex)
    onWorkoutChange({
      ...workout,
      blocks: newBlocks,
    })
  }

  const handleCooldownChange = (cooldown: WorkoutStep | undefined) => {
    if (!workout) {
      onWorkoutChange(createInitialWorkout({ cooldown }))
      return
    }
    onWorkoutChange({
      ...workout,
      cooldown,
    })
  }

  // Unified Remove Button Component
  const RemoveButton: FC<{ onPress: () => void }> = ({ onPress }) => (
    <TouchableOpacity style={$removeButton} onPress={onPress}>
      <TrashIcon size={18} color={colors.error} />
    </TouchableOpacity>
  )

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={$container}>
      <Text preset="formLabel" size="md" style={$label}>
        Warmup (Optional)
      </Text>
      <View style={$section}>
        {!workout?.warmup ? (
          <TouchableOpacity
            style={$addButton}
            onPress={() =>
              handleWarmupChange({
                goal: {
                  type: "time",
                  value: 5,
                  unit: "minutes",
                },
              })
            }
          >
            <Text preset="formLabel" size="sm" style={$addButtonText}>
              + Add Warmup
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <RemoveButton onPress={() => handleWarmupChange(undefined)} />
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
              <AlertDisplay
                alert={workout.warmup.alert}
                onAlertChange={(alert) =>
                  handleWarmupChange({
                    ...workout.warmup!,
                    alert,
                  })
                }
              />
            </View>
          </>
        )}
      </View>

      <Text preset="formLabel" size="md" style={$label}>
        Interval Blocks
      </Text>
      {(workout?.blocks || []).map((block, index) => (
        <IntervalBlockBuilder
          key={index}
          block={block}
          onBlockChange={(updatedBlock) => handleBlockChange(index, updatedBlock)}
          onDelete={() => removeBlock(index)}
        />
      ))}

      <TouchableOpacity style={$addBlockButton} onPress={addBlock}>
        <Text preset="formLabel" size="md" style={$addBlockText}>
          + Add Block
        </Text>
      </TouchableOpacity>

      <Text preset="formLabel" size="md" style={$label}>
        Cooldown (Optional)
      </Text>
      <View style={$section}>
        {!workout?.cooldown ? (
          <TouchableOpacity
            style={$addButton}
            onPress={() =>
              handleCooldownChange({
                goal: {
                  type: "time",
                  value: 5,
                  unit: "minutes",
                },
              })
            }
          >
            <Text preset="formLabel" size="sm" style={$addButtonText}>
              + Add Cooldown
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <RemoveButton onPress={() => handleCooldownChange(undefined)} />
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
              <AlertDisplay
                alert={workout.cooldown.alert}
                onAlertChange={(alert) =>
                  handleCooldownChange({
                    ...workout.cooldown!,
                    alert,
                  })
                }
              />
            </View>
          </>
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
  color: colors.palette.neutral100,
}

const $addButton: ViewStyle = {
  backgroundColor: colors.tint,
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.tint,
}

const $addButtonText: TextStyle = {
  color: colors.palette.neutral100,
}

const $removeButton: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  padding: 12,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 16,
  alignSelf: "flex-start",
  alignItems: "center",
  justifyContent: "center",
}
