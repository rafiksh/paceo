import { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"
import { XMarkIcon } from "react-native-heroicons/outline"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface WorkoutHeaderProps {
  title: string
  workoutType?: "goal" | "pacer" | "custom"
  onClose: () => void
}

export const WorkoutHeader: FC<WorkoutHeaderProps> = ({ title, workoutType, onClose }) => {
  const { themed, theme } = useAppTheme()

  const typeLabel = (() => {
    switch (workoutType) {
      case "goal":
        return "Goal"
      case "pacer":
        return "Pacer"
      case "custom":
        return "Custom"
      default:
        return undefined
    }
  })()

  const pillColors = (() => {
    switch (workoutType) {
      case "goal":
        return {
          bg: theme.colors.palette.accent100,
          border: theme.colors.palette.accent200,
          text: theme.colors.text,
        }
      case "pacer":
        return {
          bg: theme.colors.palette.secondary100,
          border: theme.colors.palette.secondary200,
          text: theme.colors.text,
        }
      case "custom":
        return {
          bg: theme.colors.palette.primary100,
          border: theme.colors.palette.primary200,
          text: theme.colors.text,
        }
      default:
        return undefined
    }
  })()

  return (
    <View style={themed($header)}>
      <View style={themed($titleRow)}>
        <Text preset="heading" size="lg" style={themed($title)}>
          {title}
        </Text>
        <TouchableOpacity style={themed($closeButton)} onPress={onClose}>
          <XMarkIcon size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {typeLabel && pillColors && (
        <View style={themed($metaRow)}>
          <View
            style={[
              themed($typePill),
              { backgroundColor: pillColors.bg, borderColor: pillColors.border },
            ]}
          >
            <Text preset="formLabel" size="xs">
              {typeLabel} workout
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

// Styles
const $header: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $titleRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $metaRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
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

const $typePill: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xs,
  paddingVertical: 4,
  borderRadius: 999,
  borderWidth: 1,
})
