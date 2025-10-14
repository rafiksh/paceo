import { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

export interface WorkoutType {
  key: string
  title: string
  subtitle: string
  description: string
  icon: string
  color: string
}

interface WorkoutTypeCardProps {
  type: WorkoutType
  isSelected: boolean
  onPress: () => void
}

export const WorkoutTypeCard: FC<WorkoutTypeCardProps> = ({ type, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        $workoutTypeCard,
        isSelected && $workoutTypeCardSelected,
        { borderLeftColor: type.color },
      ]}
      onPress={onPress}
    >
      <View style={$workoutTypeHeader}>
        <Text style={$workoutTypeIcon}>{type.icon}</Text>
        <View style={$workoutTypeInfo}>
          <Text style={[$workoutTypeTitle, isSelected && $workoutTypeTitleSelected]}>
            {type.title}
          </Text>
          <Text style={[$workoutTypeSubtitle, isSelected && $workoutTypeSubtitleSelected]}>
            {type.subtitle}
          </Text>
        </View>
      </View>
      <Text style={[$workoutTypeDescription, isSelected && $workoutTypeDescriptionSelected]}>
        {type.description}
      </Text>
    </TouchableOpacity>
  )
}

// Styles
const $workoutTypeCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: 20,
  borderWidth: 2,
  borderColor: colors.border,
  borderLeftWidth: 4,
}

const $workoutTypeCardSelected: ViewStyle = {
  backgroundColor: colors.palette.neutral900,
  borderColor: colors.palette.neutral900,
}

const $workoutTypeHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
}

const $workoutTypeIcon: TextStyle = {
  fontSize: 24,
  marginRight: 12,
}

const $workoutTypeInfo: ViewStyle = {
  flex: 1,
}

const $workoutTypeTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  fontFamily: typography.primary.bold,
  marginBottom: 2,
}

const $workoutTypeTitleSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $workoutTypeSubtitle: TextStyle = {
  fontSize: 14,
  fontWeight: "500",
  color: colors.textDim,
  fontFamily: typography.primary.medium,
}

const $workoutTypeSubtitleSelected: TextStyle = {
  color: colors.palette.neutral300,
}

const $workoutTypeDescription: TextStyle = {
  fontSize: 14,
  fontWeight: "400",
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  lineHeight: 20,
}

const $workoutTypeDescriptionSelected: TextStyle = {
  color: colors.palette.neutral300,
}
