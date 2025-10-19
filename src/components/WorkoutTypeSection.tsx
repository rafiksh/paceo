import { FC } from "react"
import { View, ViewStyle } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"

interface WorkoutTypeSectionProps {
  workoutType: "goal" | "pacer" | "custom"
}

export const WorkoutTypeSection: FC<WorkoutTypeSectionProps> = ({ workoutType }) => {
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
    <View style={$detailSection}>
      <Text preset="subheading" style={$sectionTitle}>
        Workout Type
      </Text>
      <View style={$typeCard}>
        <Text preset="heading" size="md" style={$typeText}>
          {typeInfo.title}
        </Text>
        <Text preset="formHelper" style={$typeDescription}>
          {typeInfo.description}
        </Text>
      </View>
    </View>
  )
}

// Styles
const $detailSection: ViewStyle = {
  marginBottom: 24,
}

const $sectionTitle: TextStyle = {
  marginBottom: 12,
  color: colors.text,
}

const $typeCard: ViewStyle = {
  backgroundColor: colors.palette.primary100,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.primary200,
}

const $typeText: TextStyle = {
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
}

const $typeDescription: TextStyle = {
  color: colors.textDim,
}
