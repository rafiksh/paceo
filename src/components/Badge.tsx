import { FC } from "react"
import { View, ViewStyle } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"

type BadgeSize = "sm" | "md" | "lg"
type BadgeVariant = "neutral" | "primary" | "secondary" | "accent" | "error"

interface BadgeProps {
  label: string
  size?: BadgeSize
  variant?: BadgeVariant
  style?: ViewStyle
}

export const Badge: FC<BadgeProps> = ({ label, size = "sm", variant = "neutral", style }) => {
  const { theme } = useAppTheme()

  const paddingVertical = size === "lg" ? 6 : size === "md" ? 4 : 2
  const paddingHorizontal = size === "lg" ? theme.spacing.sm : theme.spacing.xs
  const borderRadius = size === "lg" ? 14 : size === "md" ? 12 : 10

  const backgroundColor = (() => {
    switch (variant) {
      case "primary":
        return theme.colors.palette.primary100
      case "secondary":
        return theme.colors.palette.secondary100
      case "accent":
        return theme.colors.palette.accent100
      case "error":
        return theme.colors.palette.angry100
      case "neutral":
      default:
        return theme.colors.palette.neutral200
    }
  })()

  const borderColor = (() => {
    switch (variant) {
      case "primary":
        return theme.colors.palette.primary200
      case "secondary":
        return theme.colors.palette.secondary200
      case "accent":
        return theme.colors.palette.accent200
      case "error":
        return theme.colors.palette.angry500
      case "neutral":
      default:
        return theme.colors.palette.neutral300
    }
  })()

  const containerStyle: ViewStyle = {
    paddingHorizontal,
    paddingVertical,
    borderRadius,
    borderWidth: 1,
    backgroundColor,
    borderColor,
  }

  const textStyle: TextStyle = {
    color: theme.colors.text,
    fontWeight: "600",
  }

  return (
    <View style={[containerStyle, style]}>
      <Text
        preset="formLabel"
        size={size === "lg" ? "sm" : size === "md" ? "xs" : "xxs"}
        style={textStyle}
      >
        {label}
      </Text>
    </View>
  )
}
