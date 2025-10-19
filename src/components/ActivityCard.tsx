import { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

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
  const { themed } = useAppTheme()

  return (
    <TouchableOpacity
      style={[themed($activityCard), isSelected && themed($activityCardSelected)]}
      onPress={onPress}
    >
      <View style={[themed($activityIconContainer), { backgroundColor: activity.color }]}>
        <Text preset="default" size="lg">
          {activity.icon}
        </Text>
      </View>
      <Text preset="formLabel" size="xs" style={isSelected && themed($activityLabelSelected)}>
        {activity.label}
      </Text>
    </TouchableOpacity>
  )
}

// Styles
const $activityCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "center",
  padding: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: colors.border,
  minWidth: 100,
})

const $activityCardSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral900,
  borderColor: colors.palette.neutral900,
})

const $activityIconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: spacing.xs,
})

const $activityLabelSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})
