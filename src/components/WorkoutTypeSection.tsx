import { FC } from "react"
import { View, ViewStyle } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface WorkoutTypeSectionProps {
  workoutType: "goal" | "pacer" | "custom"
}

export const WorkoutTypeSection: FC<WorkoutTypeSectionProps> = ({ workoutType }) => {
  const { themed } = useAppTheme()

  const getTypeInfo = () => {
    switch (workoutType) {
      case "goal":
        return {
          title: "Goal Workout",
          description: "Set a specific target to achieve",
        }
      case "pacer":
        return {
          title: "Pacer Workout",
          description: "Maintain consistent pace throughout",
        }
      case "custom":
        return {
          title: "Custom Workout",
          description: "Complex intervals with multiple segments",
        }
      default:
        return {
          title: "Unknown Workout",
          description: "Workout type not recognized",
        }
    }
  }

  const typeInfo = getTypeInfo()

  return (
    <View style={themed($detailSection)}>
      <Text preset="subheading" style={themed($sectionTitle)}>
        Workout Type
      </Text>
      <View style={themed($typeCard)}>
        <Text preset="heading" size="md" style={themed($typeText)}>
          {typeInfo.title}
        </Text>
        <Text preset="formHelper" style={themed($typeDescription)}>
          {typeInfo.description}
        </Text>
      </View>
    </View>
  )
}

// Styles
const $detailSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginBottom: spacing.sm,
  color: colors.text,
})

const $typeCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary100,
  padding: spacing.md,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.primary200,
})

const $typeText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
})

const $typeDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})
