import { FC, useState } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"
import type { WorkoutGoal } from "expo-workoutkit"
import { TrashIcon } from "react-native-heroicons/solid"

import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"

type UnitType =
  | "seconds"
  | "minutes"
  | "hours"
  | "meters"
  | "kilometers"
  | "yards"
  | "miles"
  | "feet"
  | "calories"
  | "kilocalories"
  | "joules"
  | "kilojoules"

// Mapping from display abbreviations to actual unit values
const unitMapping: Record<string, UnitType> = {
  sec: "seconds",
  min: "minutes",
  hr: "hours",
  m: "meters",
  km: "kilometers",
  yd: "yards",
  mi: "miles",
  ft: "feet",
  cal: "calories",
  kcal: "kilocalories",
  J: "joules",
  kJ: "kilojoules",
}

// Reverse mapping from actual unit values to display abbreviations
const reverseUnitMapping: Record<UnitType, string> = {
  seconds: "sec",
  minutes: "min",
  hours: "hr",
  meters: "m",
  kilometers: "km",
  yards: "yd",
  miles: "mi",
  feet: "ft",
  calories: "cal",
  kilocalories: "kcal",
  joules: "J",
  kilojoules: "kJ",
}

interface GoalSelectorProps {
  goal: WorkoutGoal | null | undefined
  onGoalChange: (goal: WorkoutGoal) => void
  onRemove?: () => void
}

export const GoalSelector: FC<GoalSelectorProps> = ({ goal, onGoalChange, onRemove }) => {
  const [goalType, setGoalType] = useState<"time" | "distance" | "energy">(
    goal?.type === "time" || goal?.type === "distance" || goal?.type === "energy"
      ? goal.type
      : "time",
  )
  const [value, setValue] = useState(
    goal?.type === "time" || goal?.type === "distance" || goal?.type === "energy"
      ? goal?.value?.toString() || ""
      : "",
  )
  const [unit, setUnit] = useState<string>(
    goal?.type === "time"
      ? reverseUnitMapping[goal?.unit as UnitType] || "min"
      : goal?.type === "distance"
        ? reverseUnitMapping[goal?.unit as UnitType] || "km"
        : goal?.type === "energy"
          ? reverseUnitMapping[goal?.unit as UnitType] || "cal"
          : "min",
  )

  const handleGoalTypeChange = (type: "time" | "distance" | "energy") => {
    setGoalType(type)
    // Set default unit for the new type
    const defaultUnits = getUnitsForType(type)
    const newUnit = defaultUnits[0] // Use first unit as default
    setUnit(newUnit)

    const newGoal = {
      type,
      value: parseInt(value) || 1,
      unit: unitMapping[newUnit] as UnitType,
    } as WorkoutGoal
    onGoalChange(newGoal)
  }

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    const newGoal = {
      type: goalType,
      value: parseInt(newValue) || 1,
      unit: unitMapping[unit] as UnitType,
    } as WorkoutGoal
    onGoalChange(newGoal)
  }

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit)
    const newGoal = {
      type: goalType,
      value: parseInt(value) || 1,
      unit: unitMapping[newUnit] as UnitType,
    } as WorkoutGoal
    onGoalChange(newGoal)
  }

  const getUnitsForType = (type: string) => {
    switch (type) {
      case "time":
        return ["sec", "min", "hr"]
      case "distance":
        return ["m", "km", "yd", "mi", "ft"]
      case "energy":
        return ["cal", "kcal", "J", "kJ"]
      default:
        return []
    }
  }

  return (
    <View style={$container}>
      <Text preset="formLabel" size="sm">
        Goal Type
      </Text>
      <View style={$goalTypeGrid}>
        {[
          { key: "time", label: "Time" },
          { key: "distance", label: "Distance" },
          { key: "energy", label: "Energy" },
        ].map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[$goalTypeButton, goalType === type.key && $goalTypeButtonSelected]}
            onPress={() => handleGoalTypeChange(type.key as "time" | "distance" | "energy")}
          >
            <Text
              preset="formLabel"
              size="sm"
              style={goalType === type.key && $goalTypeLabelSelected}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text preset="formLabel" size="sm">
        Unit
      </Text>
      <View style={$unitGrid}>
        {getUnitsForType(goalType).map((unitOption) => (
          <TouchableOpacity
            key={unitOption}
            style={[$unitButton, unit === unitOption && $unitButtonSelected]}
            onPress={() => handleUnitChange(unitOption)}
          >
            <Text preset="formLabel" size="xs" style={unit === unitOption && $unitTextSelected}>
              {unitOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text preset="formLabel" size="sm">
        Value
      </Text>
      <TextField
        placeholder="Enter value"
        value={value}
        onChangeText={handleValueChange}
        keyboardType="numeric"
      />
      {onRemove && (
        <Button onPress={onRemove} preset="ghost" style={$removeButton}>
          <TrashIcon size={18} color={colors.error} />
        </Button>
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

const $goalTypeGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 16,
}

const $goalTypeButton: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 12,
  paddingHorizontal: 8,
  backgroundColor: colors.background,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
}

const $goalTypeButtonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $goalTypeLabelSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $unitGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 16,
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

const $unitTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $removeButton: ViewStyle = {
  position: "absolute",
  right: 0,
  top: 0,
  padding: 8,
}
