import { FC, useState } from "react"
import { View, ViewStyle, TouchableOpacity, Modal } from "react-native"
import type { TextStyle } from "react-native"
import { ChevronDownIcon } from "react-native-heroicons/outline"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

export interface Location {
  value: string
  label: string
  icon: string
  color: string
}

interface LocationDropdownProps {
  locations: Location[]
  selectedLocation: string
  onLocationChange: (location: string) => void
}

export const LocationDropdown: FC<LocationDropdownProps> = ({
  locations,
  selectedLocation,
  onLocationChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedLocationData = locations.find((loc) => loc.value === selectedLocation)

  const handleLocationSelect = (location: string) => {
    onLocationChange(location)
    setIsOpen(false)
  }

  return (
    <View style={$container}>
      <TouchableOpacity style={$dropdownButton} onPress={() => setIsOpen(true)}>
        <View style={$dropdownContent}>
          <View style={[$locationIconContainer, { backgroundColor: selectedLocationData?.color }]}>
            <Text style={$locationIcon}>{selectedLocationData?.icon}</Text>
          </View>
          <Text style={$dropdownLabel}>{selectedLocationData?.label}</Text>
        </View>
        <ChevronDownIcon size={16} color={colors.textDim} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity style={$modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={$modalContent}>
            <View style={$modalHeader}>
              <Text style={$modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={$modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={$optionsContainer}>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.value}
                  style={[$optionItem, selectedLocation === location.value && $optionItemSelected]}
                  onPress={() => handleLocationSelect(location.value)}
                >
                  <View style={$optionContent}>
                    <View style={[$locationIconContainer, { backgroundColor: location.color }]}>
                      <Text style={$locationIcon}>{location.icon}</Text>
                    </View>
                    <Text
                      style={[
                        $optionLabel,
                        selectedLocation === location.value && $optionLabelSelected,
                      ]}
                    >
                      {location.label}
                    </Text>
                  </View>
                  <View
                    style={[
                      $optionRadio,
                      selectedLocation === location.value && $optionRadioSelected,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

// Styles
const $container: ViewStyle = {
  position: "relative",
}

const $dropdownButton: ViewStyle = {
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

const $dropdownContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $locationIconContainer: ViewStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
}

const $locationIcon: TextStyle = {
  fontSize: 16,
}

const $dropdownLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

// Modal Styles
const $modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,
}

const $modalContent: ViewStyle = {
  backgroundColor: colors.background,
  borderRadius: 16,
  width: "100%",
  maxWidth: 400,
  maxHeight: "80%",
}

const $modalHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

const $modalTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  fontFamily: typography.primary.bold,
}

const $modalCloseText: TextStyle = {
  fontSize: 20,
  color: colors.textDim,
  fontWeight: "600",
}

const $optionsContainer: ViewStyle = {
  paddingVertical: 8,
}

const $optionItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 12,
  paddingHorizontal: 20,
}

const $optionItemSelected: ViewStyle = {
  backgroundColor: colors.tint,
}

const $optionContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $optionLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
}

const $optionLabelSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $optionRadio: ViewStyle = {
  width: 16,
  height: 16,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: colors.border,
  backgroundColor: colors.background,
}

const $optionRadioSelected: ViewStyle = {
  borderColor: colors.palette.neutral100,
  backgroundColor: colors.palette.neutral100,
}
