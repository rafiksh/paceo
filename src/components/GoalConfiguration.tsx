import { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

interface GoalConfigurationProps {
  goalValue: string
  goalUnit: string
  onGoalValueChange: (value: string) => void
  onGoalUnitChange: (unit: string) => void
}

export const GoalConfiguration: FC<GoalConfigurationProps> = ({
  goalValue,
  goalUnit,
  onGoalValueChange,
  onGoalUnitChange,
}) => {
  return (
    <View style={$goalContainer}>
      <View style={$goalInputContainer}>
        <Text style={$goalLabel}>Duration</Text>
        <TextField
          placeholder="30"
          value={goalValue}
          onChangeText={onGoalValueChange}
          keyboardType="numeric"
        />
      </View>
      <View style={$unitContainer}>
        <Text style={$goalLabel}>Unit</Text>
        <View style={$unitGrid}>
          {["seconds", "minutes", "hours"].map((unit) => (
            <TouchableOpacity
              key={unit}
              style={[$unitButton, goalUnit === unit && $unitButtonSelected]}
              onPress={() => onGoalUnitChange(unit)}
            >
              <Text style={[$unitText, goalUnit === unit && $unitTextSelected]}>{unit}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}

// Styles
const $goalContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
}

const $goalInputContainer: ViewStyle = {
  marginBottom: 20,
}

const $goalLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 8,
}

const $unitContainer: ViewStyle = {
  gap: 8,
}

const $unitGrid: ViewStyle = {
  flexDirection: "row",
  gap: 8,
}

const $unitButton: ViewStyle = {
  flex: 1,
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.background,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
}

const $unitButtonSelected: ViewStyle = {
  backgroundColor: colors.palette.neutral900,
  borderColor: colors.palette.neutral900,
}

const $unitText: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $unitTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}
