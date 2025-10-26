import { FC, useState } from "react"
import { View, ViewStyle, TextStyle, ScrollView, TouchableOpacity, Platform } from "react-native"
import { router } from "expo-router"
import type { HKWorkoutActivityType } from "expo-workoutkit"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { ArrowLeftIcon, CalendarIcon, XMarkIcon } from "react-native-heroicons/outline"

import { ActivityCard } from "@/components/ActivityCard"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { radius } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"
import { ACTIVITY_CATEGORIES } from "@/utils/workoutUtils"

export const CreateWorkoutScreen: FC = function CreateWorkoutScreen() {
  const { themed, theme } = useAppTheme()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleActivitySelect = (activity: HKWorkoutActivityType) => {
    router.push({
      pathname: "/(tabs)/home/configure",
      params: {
        activity,
        scheduledDate: selectedDate?.toISOString(),
      },
    })
  }

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
    }
    if (date) {
      setSelectedDate(date)
    }
  }

  const handleClearDate = () => {
    setSelectedDate(undefined)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <View style={$header}>
        <View style={$headerTop}>
          <TouchableOpacity onPress={handleBack} style={$backButton}>
            <ArrowLeftIcon size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={$headerText}>
            <Text preset="heading">Create Workout</Text>
            <Text preset="subheading">When & what will you do?</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        {/* Date Selection Section */}
        <View style={$section}>
          <Text preset="subheading" style={$sectionTitle}>
            Schedule (Optional)
          </Text>
          {selectedDate ? (
            <View style={themed($dateCard)}>
              <View style={$dateCardContent}>
                <CalendarIcon size={20} color={theme.colors.tint} />
                <Text preset="bold">{format(selectedDate, "EEE, MMM d, yyyy 'at' h:mm a")}</Text>
              </View>
              <TouchableOpacity onPress={handleClearDate}>
                <XMarkIcon size={20} color={theme.colors.textDim} />
              </TouchableOpacity>
            </View>
          ) : null}
          <Button
            preset="default"
            onPress={() => setShowDatePicker(true)}
            style={themed($dateButton)}
            LeftAccessory={() => <CalendarIcon size={20} color={theme.colors.palette.neutral100} />}
          >
            {selectedDate ? "Change Date" : "Pick a Date"}
          </Button>
          {!selectedDate && (
            <Text preset="formHelper" style={$helperText}>
              You can schedule this workout for later, or leave it unscheduled
            </Text>
          )}
        </View>

        {/* Activity Selection Section */}
        <View style={$section}>
          <Text preset="subheading" style={$sectionTitle}>
            Choose Activity
          </Text>
          {Object.entries(ACTIVITY_CATEGORIES).map(([category, activities]) => (
            <View key={category} style={$activityCategory}>
              <Text preset="bold" size="lg" style={$categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <View style={$activityGrid}>
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.value}
                    activity={activity}
                    isSelected={false}
                    onPress={() => handleActivitySelect(activity.value as HKWorkoutActivityType)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </Screen>
  )
}

// Styles
const $container: ViewStyle = {
  flex: 1,
}

const $header: ViewStyle = {
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 16,
}

const $headerTop: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 12,
}

const $backButton: ViewStyle = {
  padding: 8,
  marginLeft: -8,
}

const $headerText: ViewStyle = {
  flex: 1,
}

const $scrollContent: ViewStyle = {
  paddingBottom: 40,
}

const $section: ViewStyle = {
  paddingHorizontal: 20,
  marginBottom: 32,
}

const $sectionTitle: TextStyle = {
  marginBottom: 12,
}

const $dateCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.palette.neutral100,
  borderRadius: radius.md,
  padding: spacing.md,
  marginBottom: spacing.sm,
})

const $dateCardContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}

const $dateButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $helperText: TextStyle = {
  textAlign: "center",
  marginTop: 4,
}

const $activityCategory: ViewStyle = {
  marginBottom: 24,
}

const $categoryTitle: TextStyle = {
  marginBottom: 12,
}

const $activityGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
}
