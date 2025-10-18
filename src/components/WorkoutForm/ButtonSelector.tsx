import { FC } from "react"
import { View, ViewStyle, TouchableOpacity, TextStyle } from "react-native"
import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"
import { radius } from "@/theme/spacing"

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
  return (
    <View style={$container}>
      <View style={$buttonContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[$button, selectedValue === option.key && $buttonSelected]}
            onPress={() => onValueChange(option.key)}
          >
            <Text
              preset="formLabel"
              size="sm"
              style={[$buttonText, selectedValue === option.key && $buttonTextSelected]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && (
        <Text preset="formHelper" size="xs" style={$errorText}>
          {error}
        </Text>
      )}
    </View>
  )
}

const $container: ViewStyle = {
  marginBottom: 16,
}

const $buttonContainer: ViewStyle = {
  flexDirection: "row",
  gap: 12,
}

const $button: ViewStyle = {
  flex: 1,
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: radius.sm,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
}

const $buttonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $buttonText: TextStyle = {
  color: colors.text,
}

const $buttonTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $errorText = {
  color: colors.error,
  marginTop: 4,
}
