import { FC, useState, useEffect } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"

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
  | "pace_min_per_km"
  | "pace_min_per_mile"
  | "pace_sec_per_100m"

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
  pace_min_per_km: "min/km",
  pace_min_per_mile: "min/mi",
  pace_sec_per_100m: "s/100m",
}

interface PacerGoalSelectorProps {
  distance: {
    value?: number
    unit?: string
  }
  time: {
    value?: number
    unit?: string
  }
  onDistanceChange: (distance: { value: number; unit: string }) => void
  onTimeChange: (time: { value: number; unit: string }) => void
}

export const PacerGoalSelector: FC<PacerGoalSelectorProps> = ({
  distance,
  time,
  onDistanceChange,
  onTimeChange,
}) => {
  const [distanceValue, setDistanceValue] = useState(distance.value?.toString() || "")
  const [distanceUnit, setDistanceUnit] = useState(
    distance.unit ? reverseUnitMapping[distance.unit as UnitType] || "km" : "km",
  )
  const [timeValue, setTimeValue] = useState(time.value?.toString() || "")
  const [timeUnit, setTimeUnit] = useState(
    time.unit ? reverseUnitMapping[time.unit as UnitType] || "min" : "min",
  )
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false)
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [isPaceMode, setIsPaceMode] = useState(false)

  useEffect(() => {
    if (distance.value !== undefined && distance.unit) {
      setDistanceValue(distance.value.toString())
      setDistanceUnit(reverseUnitMapping[distance.unit as UnitType] || "km")
    }
    if (time.value !== undefined && time.unit) {
      setTimeValue(time.value.toString())
      setTimeUnit(reverseUnitMapping[time.unit as UnitType] || "min")
    }
  }, [distance.value, distance.unit, time.value, time.unit])

  const handleDistanceValueChange = (value: string) => {
    setDistanceValue(value)
    const numValue = parseInt(value) || 0
    onDistanceChange({
      value: numValue,
      unit: distanceUnit,
    })
  }

  const handleDistanceUnitChange = (unit: string) => {
    setDistanceUnit(unit)
    setShowDistanceDropdown(false)
    const numValue = parseInt(distanceValue) || 0
    onDistanceChange({
      value: numValue,
      unit: unit,
    })
  }

  const handleTimeValueChange = (value: string) => {
    setTimeValue(value)
    const numValue = parseInt(value) || 0
    onTimeChange({
      value: numValue,
      unit: timeUnit,
    })
  }

  const handleTimeUnitChange = (unit: string) => {
    setTimeUnit(unit)
    setShowTimeDropdown(false)
    const numValue = parseInt(timeValue) || 0
    onTimeChange({
      value: numValue,
      unit: unit,
    })
  }

  const getDistanceUnits = () => ["m", "km", "yd", "mi", "ft"]
  const getTimeUnits = () => (isPaceMode ? ["min/km", "min/mi", "s/100m"] : ["sec", "min", "hr"])

  // Helper function to convert time to minutes
  const convertTimeToMinutes = (value: number, unit: string): number => {
    switch (unit) {
      case "sec":
        return value / 60
      case "min":
        return value
      case "hr":
        return value * 60
      default:
        return value
    }
  }

  // Helper function to convert minutes to appropriate time unit
  const convertMinutesToTimeUnit = (minutes: number, unit: string): number => {
    switch (unit) {
      case "sec":
        return minutes * 60
      case "min":
        return minutes
      case "hr":
        return minutes / 60
      default:
        return minutes
    }
  }

  const handleToggleMode = (newIsPaceMode: boolean) => {
    setIsPaceMode(newIsPaceMode)

    // Convert between time and pace when switching modes
    if (newIsPaceMode && timeValue && distanceValue) {
      // Convert time to pace
      const timeValueNum = parseFloat(timeValue)
      const distanceInKm = parseFloat(distanceValue)

      if (timeValueNum > 0 && distanceInKm > 0) {
        // Convert current time unit to minutes
        const timeInMinutes = convertTimeToMinutes(timeValueNum, timeUnit)
        const pacePerKm = timeInMinutes / distanceInKm
        setTimeValue(pacePerKm.toFixed(2))
        setTimeUnit("min/km")
      } else {
        // Reset to default pace unit if no valid values
        setTimeValue("")
        setTimeUnit("min/km")
      }
    } else if (!newIsPaceMode && timeValue && distanceValue) {
      // Convert pace to time
      const paceValueNum = parseFloat(timeValue)
      const distanceInKm = parseFloat(distanceValue)

      if (paceValueNum > 0 && distanceInKm > 0) {
        const totalTimeInMinutes = paceValueNum * distanceInKm
        // Convert to appropriate time unit (default to minutes)
        const convertedTime = convertMinutesToTimeUnit(totalTimeInMinutes, "min")
        setTimeValue(convertedTime.toFixed(2))
        setTimeUnit("min")
      } else {
        // Reset to default time unit if no valid values
        setTimeValue("")
        setTimeUnit("min")
      }
    } else {
      // Reset to appropriate default unit when no values exist
      if (newIsPaceMode) {
        setTimeValue("")
        setTimeUnit("min/km")
      } else {
        setTimeValue("")
        setTimeUnit("min")
      }
    }
  }

  return (
    <View style={$container}>
      {/* Distance Goal */}
      <View style={$goalSection}>
        <Text preset="formLabel" size="sm">
          Distance Goal
        </Text>
        <View style={$goalRow}>
          <View style={$valueInput}>
            <TextField
              placeholder="Enter distance"
              value={distanceValue}
              onChangeText={handleDistanceValueChange}
              keyboardType="numeric"
            />
          </View>
          <View style={$dropdownContainer}>
            <TouchableOpacity
              style={$dropdownButton}
              onPress={() => setShowDistanceDropdown(!showDistanceDropdown)}
            >
              <Text preset="formLabel" size="sm" style={$dropdownText}>
                {distanceUnit}
              </Text>
              <Text style={$dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {showDistanceDropdown && (
              <View style={$dropdownList}>
                {getDistanceUnits().map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={$dropdownItem}
                    onPress={() => handleDistanceUnitChange(unit)}
                  >
                    <Text preset="formLabel" size="sm" style={$dropdownItemText}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Time/Pace Goal Toggle */}
      <View style={$toggleSection}>
        <View style={$toggleContainer}>
          <TouchableOpacity
            style={[$toggleButton, !isPaceMode && $toggleButtonActive]}
            onPress={() => handleToggleMode(false)}
          >
            <Text preset="formLabel" size="sm" style={!isPaceMode && $toggleButtonTextActive}>
              Time Goal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[$toggleButton, isPaceMode && $toggleButtonActive]}
            onPress={() => handleToggleMode(true)}
          >
            <Text preset="formLabel" size="sm" style={isPaceMode && $toggleButtonTextActive}>
              Pace Goal
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time/Pace Goal */}
      <View style={$goalSection}>
        <Text preset="formLabel" size="sm">
          {isPaceMode ? "Pace Goal" : "Time Goal"}
        </Text>
        <View style={$goalRow}>
          <View style={$valueInput}>
            <TextField
              placeholder={isPaceMode ? "Enter pace" : "Enter time"}
              value={timeValue}
              onChangeText={handleTimeValueChange}
              keyboardType="numeric"
            />
          </View>
          <View style={$dropdownContainer}>
            <TouchableOpacity
              style={$dropdownButton}
              onPress={() => setShowTimeDropdown(!showTimeDropdown)}
            >
              <Text preset="formLabel" size="sm" style={$dropdownText}>
                {timeUnit}
              </Text>
              <Text style={$dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {showTimeDropdown && (
              <View style={$dropdownList}>
                {getTimeUnits().map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={$dropdownItem}
                    onPress={() => handleTimeUnitChange(unit)}
                  >
                    <Text preset="formLabel" size="sm" style={$dropdownItemText}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
}

const $goalSection: ViewStyle = {
  marginBottom: 20,
}

const $goalRow: ViewStyle = {
  flexDirection: "row",
  gap: 12,
  marginTop: 8,
}

const $valueInput: ViewStyle = {
  flex: 1,
}

const $dropdownContainer: ViewStyle = {
  position: "relative",
  minWidth: 80,
  maxWidth: 120,
}

const $dropdownButton: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 12,
  paddingVertical: 8,
  height: 40,
}

const $dropdownText: TextStyle = {
  color: colors.text,
}

const $dropdownArrow: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
  marginLeft: 8,
}

const $dropdownList: ViewStyle = {
  position: "absolute",
  top: 40,
  left: 0,
  right: 0,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  zIndex: 1000,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
}

const $dropdownItem: ViewStyle = {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
}

const $dropdownItemText: TextStyle = {
  color: colors.text,
  textAlign: "center",
}

const $toggleSection: ViewStyle = {
  marginBottom: 20,
}

const $toggleContainer: ViewStyle = {
  flexDirection: "row",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: 4,
}

const $toggleButton: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
}

const $toggleButtonActive: ViewStyle = {
  backgroundColor: colors.tint,
}

const $toggleButtonTextActive: TextStyle = {
  color: colors.palette.neutral100,
}
