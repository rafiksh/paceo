import { FC, useState } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import type { TextStyle } from "react-native"
import type { WorkoutAlert } from "expo-workoutkit"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { AlertSelectorModal } from "./AlertSelectorModal"

interface AlertDisplayProps {
  alert?: WorkoutAlert
  onAlertChange: (alert: WorkoutAlert | undefined) => void
}

export const AlertDisplay: FC<AlertDisplayProps> = ({ alert, onAlertChange }) => {
  const { themed } = useAppTheme()
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
    <View style={themed($container)}>
      <TouchableOpacity
        style={[themed($alertButton), alert && themed($alertButtonActive)]}
        onPress={() => setModalVisible(true)}
      >
        <View style={themed($alertContent)}>
          <Text preset="formLabel" size="sm" style={themed($alertLabel)}>
            Alert
          </Text>
          {alert ? (
            <Text preset="formHelper" size="xs">
              {getAlertDisplayText(alert)}
            </Text>
          ) : (
            <Text preset="formHelper" size="xs" style={themed($alertPlaceholder)}>
              Tap to configure alert
            </Text>
          )}
        </View>
        <View style={themed($alertIcon)}>
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

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $alertButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
})

const $alertButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.accent100,
  borderColor: colors.tint,
})

const $alertContent: ViewStyle = {
  flex: 1,
}

const $alertLabel: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: 2,
})

const $alertPlaceholder: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $alertIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.sm,
})
