import { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

export interface Location {
  value: string
  label: string
  icon: string
  color: string
}

interface LocationCardProps {
  location: Location
  isSelected: boolean
  onPress: () => void
}

export const LocationCard: FC<LocationCardProps> = ({ location, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[$locationCard, isSelected && $locationCardSelected]}
      onPress={onPress}
    >
      <View style={[$locationIconContainer, { backgroundColor: location.color }]}>
        <Text style={$locationIcon}>{location.icon}</Text>
      </View>
      <Text style={[$locationLabel, isSelected && $locationLabelSelected]}>{location.label}</Text>
    </TouchableOpacity>
  )
}

// Styles
const $locationCard: ViewStyle = {
  flex: 1,
  alignItems: "center",
  padding: 20,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  borderWidth: 2,
  borderColor: colors.border,
}

const $locationCardSelected: ViewStyle = {
  backgroundColor: colors.palette.neutral900,
  borderColor: colors.palette.neutral900,
}

const $locationIconContainer: ViewStyle = {
  width: 48,
  height: 48,
  borderRadius: 24,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
}

const $locationIcon: TextStyle = {
  fontSize: 24,
}

const $locationLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  textAlign: "center",
}

const $locationLabelSelected: TextStyle = {
  color: colors.palette.neutral100,
}
