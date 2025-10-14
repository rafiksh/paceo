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
      <View style={$locationContent}>
        <View style={[$locationIconContainer, { backgroundColor: location.color }]}>
          <Text style={$locationIcon}>{location.icon}</Text>
        </View>
        <Text style={[$locationLabel, isSelected && $locationLabelSelected]}>{location.label}</Text>
      </View>
      <View style={[$locationRadio, isSelected && $locationRadioSelected]} />
    </TouchableOpacity>
  )
}

// Styles
const $locationCard: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
}

const $locationCardSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $locationContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $locationIconContainer: ViewStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
}

const $locationIcon: TextStyle = {
  fontSize: 16,
}

const $locationLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $locationLabelSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $locationRadio: ViewStyle = {
  width: 16,
  height: 16,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: colors.border,
  backgroundColor: colors.background,
}

const $locationRadioSelected: ViewStyle = {
  borderColor: colors.palette.neutral100,
  backgroundColor: colors.palette.neutral100,
}
