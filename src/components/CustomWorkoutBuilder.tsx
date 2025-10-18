import { FC } from "react"
import { View, ViewStyle, ScrollView } from "react-native"
import type { TextStyle } from "react-native"
import type { CustomWorkout, IntervalBlock, WorkoutStep } from "expo-workoutkit"

import { AlertDisplay } from "@/components/AlertDisplay"
import { Button } from "@/components/Button"
import { GoalSelector } from "@/components/GoalSelector"
import { IntervalBlockBuilder } from "@/components/IntervalBlockBuilder"
import { Text } from "@/components/Text"

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

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={$container}>
      <Text preset="formLabel" size="md" style={$warmupLabel}>
        Warmup (Optional)
      </Text>
      {!workout?.warmup ? (
        <Button
          text="+ Add Warmup"
          onPress={() =>
            handleWarmupChange({
              goal: {
                type: "time",
                value: 5,
                unit: "minutes",
              },
            })
          }
          preset="reversed"
        />
      ) : (
        <View style={$section}>
          <GoalSelector
            goal={workout.warmup.goal}
            onRemove={() => handleWarmupChange(undefined)}
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
      )}

      <Text preset="formLabel" size="md" style={$label}>
        Interval Blocks
      </Text>
      {(workout?.blocks || []).map((block, index) => (
        <IntervalBlockBuilder
          key={index}
          index={index}
          block={block}
          onBlockChange={(updatedBlock) => handleBlockChange(index, updatedBlock)}
          onDelete={() => removeBlock(index)}
        />
      ))}

      <Button text="+ Add Block" onPress={addBlock} preset="reversed" />

      <Text preset="formLabel" size="md" style={$label}>
        Cooldown (Optional)
      </Text>

      {!workout?.cooldown ? (
        <Button
          text="+ Add Cooldown"
          onPress={() =>
            handleCooldownChange({
              goal: {
                type: "time",
                value: 5,
                unit: "minutes",
              },
            })
          }
          preset="reversed"
        />
      ) : (
        <View style={$section}>
          <GoalSelector
            goal={workout.cooldown.goal}
            onRemove={() => handleCooldownChange(undefined)}
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
      )}
    </ScrollView>
  )
}

// Styles
const $container: ViewStyle = {
  flex: 1,
}

const $warmupLabel: TextStyle = {
  marginBottom: 8,
}
const $label: TextStyle = {
  marginBottom: 8,
  marginTop: 20,
}

const $section: ViewStyle = {
  gap: 16,
}
