import { FC, useState } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"
import type { WorkoutAlert } from "expo-workoutkit"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"

import { AlertSelectorModal } from "./AlertSelectorModal"

interface AlertDisplayProps {
  alert?: WorkoutAlert
  onAlertChange: (alert: WorkoutAlert | undefined) => void
}

export const AlertDisplay: FC<AlertDisplayProps> = ({ alert, onAlertChange }) => {
  const [modalVisible, setModalVisible] = useState(false)

  const getAlertDisplayText = (alert: WorkoutAlert) => {
    const { type, target, metric } = alert
    const typeLabels = {
      heartRate: "Heart Rate",
      speed: "Speed",
      power: "Power",
      cadence: "Cadence",
      pace: "Pace",
    }

    const metricLabels = {
      current: "Current",
      average: "Average",
      maximum: "Maximum",
    }

    return `${typeLabels[type]} ${metricLabels[metric]}: ${target.min}-${target.max} ${target.unit}`
  }

  const handleAlertChange = (newAlert: WorkoutAlert | undefined) => {
    onAlertChange(newAlert)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
  }

  return (
    <View style={$container}>
      <TouchableOpacity
        style={[$alertButton, alert && $alertButtonActive]}
        onPress={() => setModalVisible(true)}
      >
        <View style={$alertContent}>
          <Text preset="formLabel" size="sm" style={$alertLabel}>
            Alert
          </Text>
          {alert ? (
            <Text preset="formHelper" size="xs">
              {getAlertDisplayText(alert)}
            </Text>
          ) : (
            <Text preset="formHelper" size="xs" style={$alertPlaceholder}>
              Tap to configure alert
            </Text>
          )}
        </View>
        <View style={$alertIcon}>
          <Text preset="formLabel" size="sm">
            {alert ? "✏️" : "➕"}
          </Text>
        </View>
      </TouchableOpacity>

      <AlertSelectorModal
        visible={modalVisible}
        alert={alert}
        onAlertChange={handleAlertChange}
        onClose={handleCloseModal}
      />
    </View>
  )
}

const $container: ViewStyle = {
  marginBottom: 16,
}

const $alertButton: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
}

const $alertButtonActive: ViewStyle = {
  backgroundColor: colors.palette.accent100,
  borderColor: colors.tint,
}

const $alertContent: ViewStyle = {
  flex: 1,
}

const $alertLabel: TextStyle = {
  marginBottom: 2,
}

const $alertPlaceholder: TextStyle = {
  color: colors.textDim,
}

const $alertIcon: ViewStyle = {
  marginLeft: 12,
}
