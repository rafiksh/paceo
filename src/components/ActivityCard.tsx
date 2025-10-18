import { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"

export interface Activity {
  value: string
  label: string
  icon: string
  color: string
}

interface ActivityCardProps {
  activity: Activity
  isSelected: boolean
  onPress: () => void
}

export const ActivityCard: FC<ActivityCardProps> = ({ activity, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[$activityCard, isSelected && $activityCardSelected]}
      onPress={onPress}
    >
      <View style={[$activityIconContainer, { backgroundColor: activity.color }]}>
        <Text preset="default" size="lg">
          {activity.icon}
        </Text>
      </View>
      <Text preset="formLabel" size="xs" style={isSelected && $activityLabelSelected}>
        {activity.label}
      </Text>
    </TouchableOpacity>
  )
}

// Styles
const $activityCard: ViewStyle = {
  alignItems: "center",
  padding: 16,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: colors.border,
  minWidth: 100,
}

const $activityCardSelected: ViewStyle = {
  backgroundColor: colors.palette.neutral900,
  borderColor: colors.palette.neutral900,
}

const $activityIconContainer: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
}

const $activityLabelSelected: TextStyle = {
  color: colors.palette.neutral100,
}
