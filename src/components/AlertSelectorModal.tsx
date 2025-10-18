import { FC, useState } from "react"
import { View, ViewStyle, Modal, ScrollView } from "react-native"
import type { WorkoutAlert } from "expo-workoutkit"

import { Button } from "@/components/Button"
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
          <Button text="Cancel" onPress={onClose} preset="ghost" />
          <Text preset="heading" size="md">
            Configure Alert
          </Text>
          <Button text="Save" onPress={handleSave} preset="primary" />
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
                <Button
                  key={type.key}
                  text={type.label}
                  onPress={() => handleAlertTypeChange(type.key as any)}
                  preset={alertType === type.key ? "primary" : "default"}
                />
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
                <Button
                  key={unitOption}
                  text={unitOption}
                  onPress={() => handleUnitChange(unitOption)}
                  preset={unit === unitOption ? "primary" : "default"}
                />
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
                <Button
                  key={metricOption.key}
                  text={metricOption.label}
                  onPress={() => handleMetricChange(metricOption.key as any)}
                  preset={metric === metricOption.key ? "primary" : "default"}
                />
              ))}
            </View>
          </View>

          {alert && (
            <View style={$removeSection}>
              <Button text="Remove Alert" onPress={handleRemove} preset="destructive" />
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

const $content: ViewStyle = {
  flex: 1,
  paddingHorizontal: 20,
  paddingTop: 16,
  paddingBottom: 24,
}

const $firstSection: ViewStyle = {
  marginBottom: 24,
}

const $section: ViewStyle = {
  marginBottom: 24,
}

const $alertTypeGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
}

const $rangeContainer: ViewStyle = {
  flexDirection: "row",
  gap: 12,
  marginTop: 12,
}

const $rangeInput: ViewStyle = {
  flex: 1,
}

const $unitGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
}

const $metricGrid: ViewStyle = {
  flexDirection: "row",
  gap: 8,
  marginTop: 12,
}

const $removeSection: ViewStyle = {
  marginTop: 32,
  marginBottom: 16,
}
