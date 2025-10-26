import { FC, useState, useEffect } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, Platform, Modal } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { radius } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"

interface DatePickerModalProps {
  visible: boolean
  value: Date
  onConfirm: (date: Date) => void
  onCancel: () => void
  minimumDate?: Date
  mode?: "date" | "time" | "datetime"
}

export const DatePickerModal: FC<DatePickerModalProps> = function DatePickerModal({
  visible,
  value,
  onConfirm,
  onCancel,
  minimumDate = new Date(),
  mode = "datetime",
}) {
  const { themed, theme } = useAppTheme()
  const [tempDate, setTempDate] = useState<Date>(value)

  // Update temp date when value prop changes
  useEffect(() => {
    setTempDate(value)
  }, [value])

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      if (date) {
        onConfirm(date)
      } else {
        onCancel()
      }
    } else {
      // On iOS, update temp date
      if (date) {
        setTempDate(date)
      }
    }
  }

  const handleConfirm = () => {
    onConfirm(tempDate)
  }

  // Android uses native picker
  if (Platform.OS === "android") {
    return (
      <>
        {visible && (
          <DateTimePicker
            value={value}
            mode={mode}
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            textColor={theme.colors.text}
          />
        )}
      </>
    )
  }

  // iOS uses custom modal
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={themed($modalOverlay)}>
        <View style={themed($modalContainer)}>
          <View style={themed($modalHeader)}>
            <TouchableOpacity onPress={onCancel} style={$modalButton}>
              <Text preset="bold" style={themed($modalButtonText)}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text preset="bold" size="lg">
              Select {mode === "date" ? "Date" : mode === "time" ? "Time" : "Date & Time"}
            </Text>
            <TouchableOpacity onPress={handleConfirm} style={$modalButton}>
              <Text preset="bold" style={themed($modalConfirmText)}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode={mode}
            display="spinner"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            textColor={theme.colors.text}
            style={$datePicker}
          />
        </View>
      </View>
    </Modal>
  )
}

// Styles
const $modalOverlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end",
})

const $modalContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: radius.lg,
  borderTopRightRadius: radius.lg,
  paddingBottom: spacing.xl,
  maxHeight: "50%",
})

const $modalHeader: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $modalButton: ViewStyle = {
  paddingVertical: 8,
  paddingHorizontal: 12,
}

const $modalButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $modalConfirmText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
})

const $datePicker: ViewStyle = {
  height: 200,
}
