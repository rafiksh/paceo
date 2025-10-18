import { FC, useState } from "react"
import { View, ViewStyle, TouchableOpacity, Modal, ScrollView } from "react-native"
import type { TextStyle } from "react-native"
import type { WorkoutAlert } from "expo-workoutkit"

import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"

interface AlertSelectorModalProps {
  visible: boolean
  alert?: WorkoutAlert
  onAlertChange: (alert: WorkoutAlert | undefined) => void
  onClose: () => void
}

export const AlertSelectorModal: FC<AlertSelectorModalProps> = ({
  visible,
  alert,
  onAlertChange,
  onClose,
}) => {
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

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit)
    if (alert) {
      onAlertChange({
        ...alert,
        target: {
          ...alert.target,
          unit: newUnit,
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
      case "heartRate":
        return "bpm"
      case "speed":
        return "km/h"
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
      case "heartRate":
        return ["bpm"]
      case "speed":
        return ["km/h", "mph", "m/s"]
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

  const handleSave = () => {
    const newAlert: WorkoutAlert = {
      type: alertType,
      target: {
        min: parseInt(minValue) || 60,
        max: parseInt(maxValue) || 180,
        unit,
      },
      metric,
    }
    onAlertChange(newAlert)
    onClose()
  }

  const handleRemove = () => {
    onAlertChange(undefined)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={$modalContainer}>
        <View style={$header}>
          <TouchableOpacity onPress={onClose} style={$closeButton}>
            <Text preset="formLabel" size="md">
              Cancel
            </Text>
          </TouchableOpacity>
          <Text preset="heading" size="md">
            Configure Alert
          </Text>
          <TouchableOpacity onPress={handleSave} style={$saveButton}>
            <Text preset="formLabel" size="md" style={$saveButtonText}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={$content} showsVerticalScrollIndicator={false}>
          <View style={$firstSection}>
            <Text preset="formLabel" size="sm">
              Alert Type
            </Text>
            <View style={$alertTypeGrid}>
              {[
                { key: "heartRate", label: "Heart Rate" },
                { key: "speed", label: "Speed" },
                { key: "power", label: "Power" },
                { key: "cadence", label: "Cadence" },
                { key: "pace", label: "Pace" },
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[$alertTypeButton, alertType === type.key && $alertTypeButtonSelected]}
                  onPress={() => handleAlertTypeChange(type.key as any)}
                >
                  <Text
                    preset="formLabel"
                    size="sm"
                    style={[$alertTypeText, alertType === type.key && $alertTypeTextSelected]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={$section}>
            <Text preset="formLabel" size="sm">
              Target Range
            </Text>
            <View style={$rangeContainer}>
              <View style={$rangeInput}>
                <Text preset="formLabel" size="xs">
                  Min
                </Text>
                <TextField
                  value={minValue}
                  onChangeText={handleMinValueChange}
                  keyboardType="numeric"
                  placeholder="60"
                />
              </View>
              <View style={$rangeInput}>
                <Text preset="formLabel" size="xs">
                  Max
                </Text>
                <TextField
                  value={maxValue}
                  onChangeText={handleMaxValueChange}
                  keyboardType="numeric"
                  placeholder="180"
                />
              </View>
            </View>
          </View>

          <View style={$section}>
            <Text preset="formLabel" size="sm">
              Unit
            </Text>
            <View style={$unitGrid}>
              {getUnitsForType(alertType).map((unitOption) => (
                <TouchableOpacity
                  key={unitOption}
                  style={[$unitButton, unit === unitOption && $unitButtonSelected]}
                  onPress={() => handleUnitChange(unitOption)}
                >
                  <Text
                    preset="formLabel"
                    size="xs"
                    style={[$unitText, unit === unitOption && $unitTextSelected]}
                  >
                    {unitOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={$section}>
            <Text preset="formLabel" size="sm">
              Metric
            </Text>
            <View style={$metricGrid}>
              {[
                { key: "current", label: "Current" },
                { key: "average", label: "Average" },
                { key: "maximum", label: "Maximum" },
              ].map((metricOption) => (
                <TouchableOpacity
                  key={metricOption.key}
                  style={[$metricButton, metric === metricOption.key && $metricButtonSelected]}
                  onPress={() => handleMetricChange(metricOption.key as any)}
                >
                  <Text
                    preset="formLabel"
                    size="sm"
                    style={[$metricText, metric === metricOption.key && $metricTextSelected]}
                  >
                    {metricOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {alert && (
            <View style={$removeSection}>
              <TouchableOpacity style={$removeButton} onPress={handleRemove}>
                <Text preset="formLabel" size="md" style={$removeButtonText}>
                  Remove Alert
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  )
}

const $modalContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $header: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

const $closeButton: ViewStyle = {
  paddingVertical: 8,
  paddingHorizontal: 12,
}

const $saveButton: ViewStyle = {
  paddingVertical: 8,
  paddingHorizontal: 12,
}

const $saveButtonText: TextStyle = {
  color: colors.tint,
}

const $content: ViewStyle = {
  flex: 1,
  paddingHorizontal: 20,
  paddingTop: 8,
  paddingBottom: 20,
}

const $firstSection: ViewStyle = {
  marginTop: 16,
  marginBottom: 16,
}

const $section: ViewStyle = {
  marginTop: 24,
  marginBottom: 16,
}

const $alertTypeGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 12,
  marginBottom: 8,
}

const $alertTypeButton: ViewStyle = {
  flex: 1,
  minWidth: "45%",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  marginRight: 8,
  marginBottom: 8,
}

const $alertTypeButtonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $alertTypeText: TextStyle = {
  textAlign: "center",
}

const $alertTypeTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $rangeContainer: ViewStyle = {
  flexDirection: "row",
  marginTop: 12,
  marginBottom: 8,
}

const $rangeInput: ViewStyle = {
  flex: 1,
  marginRight: 8,
}

const $unitGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 12,
  marginBottom: 8,
}

const $unitButton: ViewStyle = {
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: colors.background,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  marginRight: 8,
  marginBottom: 8,
}

const $unitButtonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $unitText: TextStyle = {
  textAlign: "center",
}

const $unitTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $metricGrid: ViewStyle = {
  flexDirection: "row",
  marginTop: 12,
  marginBottom: 8,
}

const $metricButton: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  marginRight: 8,
}

const $metricButtonSelected: ViewStyle = {
  backgroundColor: colors.tint,
  borderColor: colors.tint,
}

const $metricText: TextStyle = {
  textAlign: "center",
}

const $metricTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $removeSection: ViewStyle = {
  marginTop: 32,
  marginBottom: 40,
}

const $removeButton: ViewStyle = {
  backgroundColor: colors.error,
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
}

const $removeButtonText: TextStyle = {
  color: colors.palette.neutral100,
}
