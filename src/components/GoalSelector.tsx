import { FC, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import type { WorkoutGoal } from "expo-workoutkit"
import { TrashIcon } from "react-native-heroicons/solid"

import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

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
  type?: "embedded" | "full"
}

export const GoalSelector: FC<GoalSelectorProps> = ({
  goal,
  onGoalChange,
  onRemove,
  type = "full",
}) => {
  const { themed } = useAppTheme()
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
    <View style={type === "full" && themed($container)}>
      <Text preset="formLabel" size="sm">
        Goal Type
      </Text>
      <View style={themed($grid)}>
        {[
          { key: "time", label: "Time" },
          { key: "distance", label: "Distance" },
          { key: "energy", label: "Energy" },
        ].map((type) => (
          <Button
            key={type.key}
            text={type.label}
            onPress={() => handleGoalTypeChange(type.key as "time" | "distance" | "energy")}
            preset={goalType === type.key ? "primary" : "default"}
          />
        ))}
      </View>

      <Text preset="formLabel" size="sm">
        Unit
      </Text>
      <View style={themed($grid)}>
        {getUnitsForType(goalType).map((unitOption) => (
          <Button
            key={unitOption}
            text={unitOption}
            onPress={() => handleUnitChange(unitOption)}
            preset={unit === unitOption ? "primary" : "default"}
          />
        ))}
      </View>

      <Text preset="formLabel" size="sm">
        Target
      </Text>
      <TextField
        placeholder="Enter value"
        value={value}
        onChangeText={handleValueChange}
        keyboardType="numeric"
        RightAccessory={() => (
          <Text preset="formLabel" size="sm" style={themed($unitTextStyle)}>
            {unit}
          </Text>
        )}
      />
      {onRemove && (
        <Button onPress={onRemove} preset="ghost" style={themed($removeButton)}>
          <TrashIcon size={18} color={themed($trashIconColor)} />
        </Button>
      )}
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
})

const $grid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
  marginBottom: spacing.md,
})

const $removeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  right: 0,
  top: 0,
  padding: spacing.xs,
})

const $unitTextStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginRight: spacing.xs,
  textAlign: "right",
  alignSelf: "center",
})

const $trashIconColor: ThemedStyle<string> = ({ colors }) => colors.error
