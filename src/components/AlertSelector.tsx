import { FC, useState } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"
import type { WorkoutAlert } from "expo-workoutkit"

import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

interface AlertSelectorProps {
  alert?: WorkoutAlert
  onAlertChange: (alert: WorkoutAlert | undefined) => void
}

export const AlertSelector: FC<AlertSelectorProps> = ({ alert, onAlertChange }) => {
  const [alertType, setAlertType] = useState<"speed" | "heartRate" | "power" | "cadence" | "pace">(
    alert?.type || "heartRate",
  )
  const [minValue, setMinValue] = useState(alert?.target.min.toString() || "60")
  const [maxValue, setMaxValue] = useState(alert?.target.max.toString() || "180")
  const [unit, setUnit] = useState(alert?.target.unit || "bpm")
  const [metric, setMetric] = useState<"current" | "average" | "maximum">(
    alert?.metric || "current",
  )

  const handleAlertTypeChange = (type: "speed" | "heartRate" | "power" | "cadence" | "pace") => {
    setAlertType(type)
    const newAlert: WorkoutAlert = {
      type,
      target: {
        min: parseInt(minValue) || 60,
        max: parseInt(maxValue) || 180,
        unit: getDefaultUnit(type),
      },
      metric,
    }
    onAlertChange(newAlert)
  }

  const handleMinValueChange = (value: string) => {
    setMinValue(value)
    if (alert) {
      onAlertChange({
        ...alert,
        target: {
          ...alert.target,
          min: parseInt(value) || 60,
        },
      })
    }
  }

  const handleMaxValueChange = (value: string) => {
    setMaxValue(value)
    if (alert) {
      onAlertChange({
        ...alert,
        target: {
          ...alert.target,
          max: parseInt(value) || 180,
        },
      })
    }
  }

  const handleMetricChange = (newMetric: "current" | "average" | "maximum") => {
    setMetric(newMetric)
    if (alert) {
      onAlertChange({
        ...alert,
        metric: newMetric,
      })
    }
  }

  const getDefaultUnit = (type: string) => {
    switch (type) {
      case "speed":
        return "km/h"
      case "heartRate":
        return "bpm"
      case "power":
        return "watts"
      case "cadence":
        return "rpm"
      case "pace":
        return "min/km"
      default:
        return "bpm"
    }
  }

  const getUnitsForType = (type: string) => {
    switch (type) {
      case "speed":
        return ["km/h", "mph", "m/s"]
      case "heartRate":
        return ["bpm"]
      case "power":
        return ["watts", "hp"]
      case "cadence":
        return ["rpm", "spm"]
      case "pace":
        return ["min/km", "min/mile", "s/100m"]
      default:
        return ["bpm"]
    }
  }

  const toggleAlert = () => {
    if (alert) {
      onAlertChange(undefined)
    } else {
      const newAlert: WorkoutAlert = {
        type: alertType,
        target: {
          min: parseInt(minValue) || 60,
          max: parseInt(maxValue) || 180,
          unit: getDefaultUnit(alertType),
        },
        metric,
      }
      onAlertChange(newAlert)
    }
  }

  return (
    <View style={$container}>
      <TouchableOpacity style={$toggleButton} onPress={toggleAlert}>
        <Text style={$toggleButtonText}>{alert ? "Remove Alert" : "Add Alert"}</Text>
      </TouchableOpacity>

      {alert && (
        <View style={$alertConfig}>
          <Text style={$label}>Alert Type</Text>
          <View style={$alertTypeGrid}>
            {[
              { key: "heartRate", label: "Heart Rate", icon: "❤️" },
              { key: "speed", label: "Speed", icon: "🏃‍♂️" },
              { key: "power", label: "Power", icon: "⚡" },
              { key: "cadence", label: "Cadence", icon: "🔄" },
              { key: "pace", label: "Pace", icon: "⏱️" },
            ].map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[$alertTypeButton, alertType === type.key && $alertTypeButtonSelected]}
                onPress={() => handleAlertTypeChange(type.key as any)}
              >
                <Text style={$alertTypeIcon}>{type.icon}</Text>
                <Text style={[$alertTypeLabel, alertType === type.key && $alertTypeLabelSelected]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={$label}>Target Range</Text>
          {metric === "current" ? (
            <View style={$rangeContainer}>
              <View style={$rangeInput}>
                <Text style={$rangeLabel}>Min</Text>
                <TextField
                  placeholder="Min value"
                  value={minValue}
                  onChangeText={handleMinValueChange}
                  keyboardType="numeric"
                />
              </View>
              <View style={$rangeInput}>
                <Text style={$rangeLabel}>Max</Text>
                <TextField
                  placeholder="Max value"
                  value={maxValue}
                  onChangeText={handleMaxValueChange}
                  keyboardType="numeric"
                />
              </View>
              <View style={$unitContainer}>
                <Text style={$rangeLabel}>Unit</Text>
                <View style={$unitGrid}>
                  {getUnitsForType(alertType).map((unitOption) => (
                    <TouchableOpacity
                      key={unitOption}
                      style={[$unitButton, unit === unitOption && $unitButtonSelected]}
                      onPress={() => {
                        setUnit(unitOption)
                        if (alert) {
                          onAlertChange({
                            ...alert,
                            target: { ...alert.target, unit: unitOption },
                          })
                        }
                      }}
                    >
                      <Text style={[$unitText, unit === unitOption && $unitTextSelected]}>
                        {unitOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={$singleValueContainer}>
              <View style={$singleValueInput}>
                <Text style={$rangeLabel}>Target Value</Text>
                <TextField
                  placeholder="Target value"
                  value={metric === "average" ? minValue : maxValue}
                  onChangeText={(value) => {
                    if (metric === "average") {
                      handleMinValueChange(value)
                    } else {
                      handleMaxValueChange(value)
                    }
                  }}
                  keyboardType="numeric"
                />
              </View>
              <View style={$unitContainer}>
                <Text style={$rangeLabel}>Unit</Text>
                <View style={$unitGrid}>
                  {getUnitsForType(alertType).map((unitOption) => (
                    <TouchableOpacity
                      key={unitOption}
                      style={[$unitButton, unit === unitOption && $unitButtonSelected]}
                      onPress={() => {
                        setUnit(unitOption)
                        if (alert) {
                          onAlertChange({
                            ...alert,
                            target: { ...alert.target, unit: unitOption },
                          })
                        }
                      }}
                    >
                      <Text style={[$unitText, unit === unitOption && $unitTextSelected]}>
                        {unitOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          <Text style={$label}>Alert Type</Text>
          <View style={$metricGrid}>
            {[
              {
                key: "current",
                label: "Range Alert",
                description: "Alert when outside min/max range",
              },
              {
                key: "average",
                label: "Average Alert",
                description: "Alert when average exceeds target",
              },
              {
                key: "maximum",
                label: "Peak Alert",
                description: "Alert when maximum exceeds target",
              },
            ].map((metricOption) => (
              <TouchableOpacity
                key={metricOption.key}
                style={[$metricButton, metric === metricOption.key && $metricButtonSelected]}
                onPress={() => handleMetricChange(metricOption.key as any)}
              >
                <Text style={[$metricText, metric === metricOption.key && $metricTextSelected]}>
                  {metricOption.label}
                </Text>
                <Text
                  style={[
                    $metricDescription,
                    metric === metricOption.key && $metricDescriptionSelected,
                  ]}
                >
                  {metricOption.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

// Styles
const $container: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
  marginTop: 12,
}

const $toggleButton: ViewStyle = {
  backgroundColor: colors.tint,
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 16,
  alignItems: "center",
}

const $toggleButtonText: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.palette.neutral100,
  fontFamily: typography.primary.semiBold,
}

const $alertConfig: ViewStyle = {
  marginTop: 16,
}

const $label: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 8,
}

const $alertTypeGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 16,
}

const $alertTypeButton: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: 12,
  backgroundColor: colors.background,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  minWidth: 100,
}

const $alertTypeButtonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $alertTypeIcon: TextStyle = {
  fontSize: 16,
  marginRight: 8,
}

const $alertTypeLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $alertTypeLabelSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $rangeContainer: ViewStyle = {
  flexDirection: "row",
  gap: 12,
  marginBottom: 16,
}

const $singleValueContainer: ViewStyle = {
  flexDirection: "row",
  gap: 12,
  marginBottom: 16,
}

const $singleValueInput: ViewStyle = {
  flex: 1,
}

const $rangeInput: ViewStyle = {
  flex: 1,
}

const $rangeLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 4,
}

const $unitContainer: ViewStyle = {
  flex: 1,
}

const $unitGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 4,
}

const $unitButton: ViewStyle = {
  paddingVertical: 6,
  paddingHorizontal: 8,
  backgroundColor: colors.background,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: colors.border,
}

const $unitButtonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $unitText: TextStyle = {
  fontSize: 10,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $unitTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $metricGrid: ViewStyle = {
  flexDirection: "row",
  gap: 8,
}

const $metricButton: ViewStyle = {
  flex: 1,
  paddingVertical: 12,
  paddingHorizontal: 12,
  backgroundColor: colors.background,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
}

const $metricButtonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $metricText: TextStyle = {
  fontSize: 12,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $metricTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $metricDescription: TextStyle = {
  fontSize: 10,
  fontWeight: "400",
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
  marginTop: 2,
}

const $metricDescriptionSelected: TextStyle = {
  color: colors.palette.neutral300,
}
