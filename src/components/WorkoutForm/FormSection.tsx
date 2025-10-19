import { FC, ReactNode } from "react"
import { View, ViewStyle, TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface FormSectionProps {
  title: string
  children: ReactNode
  error?: string
}

export const FormSection: FC<FormSectionProps> = ({ title, children, error }) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($section)}>
      <Text preset="subheading" size="md">
        {title}
      </Text>
      {children}
      {error && (
        <Text preset="formHelper" size="xs" style={themed($errorText)}>
          {error}
        </Text>
      )}
    </View>
  )
}

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  marginTop: 4,
})
