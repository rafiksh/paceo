import { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"
import { XMarkIcon } from "react-native-heroicons/outline"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"

interface WorkoutHeaderProps {
  title: string
  onClose: () => void
}

export const WorkoutHeader: FC<WorkoutHeaderProps> = ({ title, onClose }) => {
  return (
    <View style={$header}>
      <Text preset="heading" size="lg" style={$title}>
        {title}
      </Text>
      <TouchableOpacity style={$closeButton} onPress={onClose}>
        <XMarkIcon size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  )
}

// Styles
const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 24,
  paddingVertical: 20,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

const $title: TextStyle = {
  flex: 1,
  marginRight: 16,
}

const $closeButton: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
}
