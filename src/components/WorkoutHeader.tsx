import { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"
import { XMarkIcon } from "react-native-heroicons/outline"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface WorkoutHeaderProps {
  title: string
  onClose: () => void
}

export const WorkoutHeader: FC<WorkoutHeaderProps> = ({ title, onClose }) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($header)}>
      <Text preset="heading" size="lg" style={themed($title)}>
        {title}
      </Text>
      <TouchableOpacity style={themed($closeButton)} onPress={onClose}>
        <XMarkIcon size={20} color={themed($iconColor)} />
      </TouchableOpacity>
    </View>
  )
}

// Styles
const $header: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing.md,
})

const $closeButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
})

const $iconColor: ThemedStyle<string> = ({ colors }) => colors.text
