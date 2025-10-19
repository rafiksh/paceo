import { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

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
  const { themed } = useAppTheme()

  return (
    <TouchableOpacity
      style={[themed($locationCard), isSelected && themed($locationCardSelected)]}
      onPress={onPress}
    >
      <View style={themed($locationContent)}>
        <View style={[themed($locationIconContainer), { backgroundColor: location.color }]}>
          <Text size="sm">{location.icon}</Text>
        </View>
        <Text style={[themed($locationLabel), isSelected && themed($locationLabelSelected)]}>
          {location.label}
        </Text>
      </View>
      <View style={[themed($locationRadio), isSelected && themed($locationRadioSelected)]} />
    </TouchableOpacity>
  )
}

// Styles
const $locationCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
})

const $locationCardSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $locationContent: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
})

const $locationIconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.sm,
})

const $locationLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
})

const $locationLabelSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $locationRadio: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 16,
  height: 16,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: colors.border,
  backgroundColor: colors.background,
})

const $locationRadioSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.neutral100,
  backgroundColor: colors.palette.neutral100,
})
