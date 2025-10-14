import { FC, useState } from "react"
import { View, ViewStyle, TextStyle, Alert } from "react-native"
import { PreviewWorkoutButton } from "expo-workoutkit"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

export const WorkoutScreen: FC = function WorkoutScreen() {
  const { themed } = useAppTheme()
  const [selectedWorkout, setSelectedWorkout] = useState<"goal" | "pacer" | "custom">("goal")

  const goalWorkout = {
    type: "goal" as const,
    workout: {
      activity: "running" as const,
      location: "outdoor" as const,
      goal: {
        type: "time" as const,
        value: 30,
        unit: "minutes" as const,
      },
    },
  }

  const pacerWorkout = {
    type: "pacer" as const,
    workout: {
      activity: "running" as const,
      location: "outdoor" as const,
      distance: {
        value: 5,
        unit: "kilometers" as const,
      },
      time: {
        value: 30,
        unit: "minutes" as const,
      },
    },
  }

  const customWorkout = {
    type: "custom" as const,
    workout: {
      activity: "running" as const,
      location: "outdoor" as const,
      displayName: "Interval Training",
      warmup: {
        goal: {
          type: "time" as const,
          value: 10,
          unit: "minutes" as const,
        },
      },
      blocks: [
        {
          steps: [
            {
              purpose: "work" as const,
              step: {
                goal: {
                  type: "distance" as const,
                  value: 1,
                  unit: "kilometers" as const,
                },
              },
            },
            {
              purpose: "recovery" as const,
              step: {
                goal: {
                  type: "time" as const,
                  value: 2,
                  unit: "minutes" as const,
                },
              },
            },
          ],
          iterations: 5,
        },
      ],
      cooldown: {
        goal: {
          type: "time" as const,
          value: 10,
          unit: "minutes" as const,
        },
      },
    },
  }

  const getCurrentWorkout = () => {
    switch (selectedWorkout) {
      case "goal":
        return goalWorkout
      case "pacer":
        return pacerWorkout
      case "custom":
        return customWorkout
      default:
        return goalWorkout
    }
  }

  const handleButtonPress = ({
    nativeEvent: { message },
  }: {
    nativeEvent: { message: string }
  }) => {
    Alert.alert("Workout Button Pressed", message)
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.flex1}>
      <View style={themed($container)}>
        <Text preset="heading" style={themed($title)}>
          WorkoutKit Demo
        </Text>

        <Text preset="subheading" style={themed($subtitle)}>
          Choose a workout type to preview:
        </Text>

        <View style={themed($buttonContainer)}>
          <Button
            text="Goal Workout"
            onPress={() => setSelectedWorkout("goal")}
            style={themed([$workoutButton, selectedWorkout === "goal" && $selectedButton])}
          />
          <Button
            text="Pacer Workout"
            onPress={() => setSelectedWorkout("pacer")}
            style={themed([$workoutButton, selectedWorkout === "pacer" && $selectedButton])}
          />
          <Button
            text="Custom Workout"
            onPress={() => setSelectedWorkout("custom")}
            style={themed([$workoutButton, selectedWorkout === "custom" && $selectedButton])}
          />
        </View>

        <View style={themed($previewContainer)}>
          <Text preset="subheading" style={themed($previewTitle)}>
            Workout Preview:
          </Text>

          <PreviewWorkoutButton
            workoutPlan={getCurrentWorkout()}
            onButtonPress={handleButtonPress}
            style={themed($previewButton)}
          />
        </View>

        <Text preset="default" style={themed($description)}>
          Tap the workout button above to see the native iOS WorkoutKit preview. This will open the
          iOS workout interface where you can start your workout.
        </Text>
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.xl,
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  textAlign: "center",
})

const $subtitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  textAlign: "center",
})

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginBottom: spacing.xl,
  gap: spacing.sm,
})

const $workoutButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  minWidth: "30%",
  marginBottom: spacing.sm,
})

const $selectedButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
})

const $previewContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $previewTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  textAlign: "center",
})

const $previewButton: ThemedStyle<ViewStyle> = () => ({
  height: 100,
  borderRadius: 12,
})

const $description: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
  lineHeight: 20,
})
