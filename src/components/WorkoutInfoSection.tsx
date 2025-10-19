import { FC } from "react"
import { View, ViewStyle } from "react-native"
import type { TextStyle } from "react-native"
import { HomeIcon, SunIcon } from "react-native-heroicons/outline"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"

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
  return (
    <View style={$detailSection}>
      <Text preset="subheading" style={$sectionTitle}>
        Workout Information
      </Text>
      <View style={$infoCard}>
        <View style={$infoRow}>
          <Text preset="formLabel">Activity</Text>
          <Text preset="heading" size="sm">
            {activity.charAt(0).toUpperCase() + activity.slice(1)}
          </Text>
        </View>
        <View style={$infoRow}>
          <Text preset="formLabel">Location</Text>
          <View style={$locationInfo}>
            {location === "indoor" ? (
              <HomeIcon size={16} color={colors.palette.secondary500} />
            ) : (
              <SunIcon size={16} color={colors.palette.accent500} />
            )}
            <Text preset="heading" size="sm" style={$locationText}>
              {location === "indoor" ? "Indoor" : "Outdoor"}
            </Text>
          </View>
        </View>
        <View style={$infoRow}>
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
const $detailSection: ViewStyle = {
  marginBottom: 24,
}

const $sectionTitle: TextStyle = {
  marginBottom: 12,
  color: colors.text,
}

const $infoCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
}

const $infoRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 8,
}

const $locationInfo: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
}

const $locationText: TextStyle = {
  color: colors.textDim,
}
