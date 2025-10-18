import { FC, ReactNode } from "react"
import { View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"

interface FormSectionProps {
  title: string
  children: ReactNode
  error?: string
}

export const FormSection: FC<FormSectionProps> = ({ title, children, error }) => {
  return (
    <View style={$section}>
      <Text preset="subheading" size="md">
        {title}
      </Text>
      {children}
      {error && (
        <Text preset="formHelper" size="xs" style={$errorText}>
          {error}
        </Text>
      )}
    </View>
  )
}

const $section: ViewStyle = {
  marginBottom: 24,
}

const $errorText = {
  color: colors.error,
  marginTop: 4,
}
