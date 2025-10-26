import { FC } from "react"
import { View, ViewStyle, TouchableOpacity, TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ButtonOption {
  key: string
  label: string
}

interface ButtonSelectorProps {
  options: ButtonOption[]
  selectedValue: string
  onValueChange: (value: string) => void
  error?: string
}

export const ButtonSelector: FC<ButtonSelectorProps> = ({
  options,
  selectedValue,
  onValueChange,
  error,
}) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($container)}>
      <View style={themed($buttonContainer)}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[themed($button), selectedValue === option.key && themed($buttonSelected)]}
            onPress={() => onValueChange(option.key)}
          >
            <Text
              preset="formLabel"
              size="sm"
              style={[
                themed($buttonText),
                selectedValue === option.key && themed($buttonTextSelected),
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && (
        <Text preset="formHelper" size="xs" style={themed($errorText)}>
          {error}
        </Text>
      )}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $button: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
})

const $buttonSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $buttonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $buttonTextSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  marginTop: 4,
})
