import { FC } from "react"
import { View, ViewStyle } from "react-native"
import type { TextStyle } from "react-native"
import { HomeIcon, SunIcon } from "react-native-heroicons/outline"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface WorkoutInfoSectionProps {
  activity: string
  location: "indoor" | "outdoor"
  createdAt: Date
}

export const WorkoutInfoSection: FC<WorkoutInfoSectionProps> = ({
  activity,
  location,
  createdAt,
}) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($detailSection)}>
      <Text preset="subheading" style={themed($sectionTitle)}>
        Workout Information
      </Text>
      <View style={themed($infoCard)}>
        <View style={themed($infoRow)}>
          <Text preset="formLabel">Activity</Text>
          <Text preset="heading" size="sm">
            {activity.charAt(0).toUpperCase() + activity.slice(1)}
          </Text>
        </View>
        <View style={themed($infoRow)}>
          <Text preset="formLabel">Location</Text>
          <View style={themed($locationInfo)}>
            {location === "indoor" ? (
              <HomeIcon size={16} color={themed($indoorIconColor)} />
            ) : (
              <SunIcon size={16} color={themed($outdoorIconColor)} />
            )}
            <Text preset="heading" size="sm" style={themed($locationText)}>
              {location === "indoor" ? "Indoor" : "Outdoor"}
            </Text>
          </View>
        </View>
        <View style={themed($infoRow)}>
          <Text preset="formLabel">Created</Text>
          <Text preset="heading" size="sm">
            {createdAt.toLocaleDateString()}
          </Text>
        </View>
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

const $infoCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
})

const $infoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.xs,
})

const $locationInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
})

const $locationText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $indoorIconColor: ThemedStyle<string> = ({ colors }) => colors.palette.secondary500
const $outdoorIconColor: ThemedStyle<string> = ({ colors }) => colors.palette.accent500
