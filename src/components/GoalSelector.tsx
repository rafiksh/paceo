import { FC, useState } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"
import type { WorkoutGoal } from "expo-workoutkit"

import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

interface GoalSelectorProps {
  goal: WorkoutGoal
  onGoalChange: (goal: WorkoutGoal) => void
}

export const GoalSelector: FC<GoalSelectorProps> = ({ goal, onGoalChange }) => {
  const [goalType, setGoalType] = useState<"open" | "time" | "distance" | "energy">(
    goal.type === "open" ? "open" : goal.type,
  )
  const [value, setValue] = useState(
    goal.type === "open"
      ? ""
      : goal.type === "time" || goal.type === "distance" || goal.type === "energy"
        ? goal.value.toString()
        : "",
  )
  const [unit, setUnit] = useState<string>(
    goal.type === "time"
      ? goal.unit
      : goal.type === "distance"
        ? goal.unit
        : goal.type === "energy"
          ? goal.unit
          : "minutes",
  )

  const handleGoalTypeChange = (type: "open" | "time" | "distance" | "energy") => {
    setGoalType(type)
    if (type === "open") {
      onGoalChange({ type: "open" })
    } else {
      const newGoal = {
        type,
        value: parseInt(value) || 1,
        unit: unit as any,
      } as WorkoutGoal
      onGoalChange(newGoal)
    }
  }

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    if (goalType !== "open") {
      const newGoal = {
        type: goalType,
        value: parseInt(newValue) || 1,
        unit: unit as any,
      } as WorkoutGoal
      onGoalChange(newGoal)
    }
  }

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit)
    if (goalType !== "open") {
      const newGoal = {
        type: goalType,
        value: parseInt(value) || 1,
        unit: newUnit as any,
      } as WorkoutGoal
      onGoalChange(newGoal)
    }
  }

  const getUnitsForType = (type: string) => {
    switch (type) {
      case "time":
        return ["seconds", "minutes", "hours"]
      case "distance":
        return ["meters", "kilometers", "yards", "miles", "feet"]
      case "energy":
        return ["calories", "kilocalories", "joules", "kilojoules"]
      default:
        return []
    }
  }

  return (
    <View style={$container}>
      <Text style={$label}>Goal Type</Text>
      <View style={$goalTypeGrid}>
        {[
          { key: "open", label: "Open", icon: "♾️" },
          { key: "time", label: "Time", icon: "⏱️" },
          { key: "distance", label: "Distance", icon: "📏" },
          { key: "energy", label: "Energy", icon: "🔥" },
        ].map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[$goalTypeButton, goalType === type.key && $goalTypeButtonSelected]}
            onPress={() => handleGoalTypeChange(type.key as any)}
          >
            <Text style={$goalTypeIcon}>{type.icon}</Text>
            <Text style={[$goalTypeLabel, goalType === type.key && $goalTypeLabelSelected]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {goalType !== "open" && (
        <>
          <Text style={$label}>Value</Text>
          <TextField
            placeholder="Enter value"
            value={value}
            onChangeText={handleValueChange}
            keyboardType="numeric"
          />

          <Text style={$label}>Unit</Text>
          <View style={$unitGrid}>
            {getUnitsForType(goalType).map((unitOption) => (
              <TouchableOpacity
                key={unitOption}
                style={[$unitButton, unit === unitOption && $unitButtonSelected]}
                onPress={() => handleUnitChange(unitOption)}
              >
                <Text style={[$unitText, unit === unitOption && $unitTextSelected]}>
                  {unitOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  )
}

// Styles
const $container: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
}

const $label: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 8,
}

const $goalTypeGrid: ViewStyle = {
  flexDirection: "column",
  gap: 12,
  marginBottom: 20,
}

const $goalTypeButton: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: 16,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: colors.border,
  minHeight: 60,
}

const $goalTypeButtonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
  shadowColor: colors.tint,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
}

const $goalTypeIcon: TextStyle = {
  fontSize: 24,
  marginRight: 12,
}

const $goalTypeLabel: TextStyle = {
  fontSize: 16,
  fontWeight: "700",
  color: colors.text,
  fontFamily: typography.primary.bold,
  textAlign: "left",
  flex: 1,
}

const $goalTypeLabelSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $unitGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
}

const $unitButton: ViewStyle = {
  paddingVertical: 10,
  paddingHorizontal: 14,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: colors.border,
  minHeight: 36,
}

const $unitButtonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $unitText: TextStyle = {
  fontSize: 13,
  fontWeight: "700",
  color: colors.text,
  fontFamily: typography.primary.bold,
}

const $unitTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}
