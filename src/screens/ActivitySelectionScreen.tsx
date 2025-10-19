import { FC } from "react"
import { View, ViewStyle, ScrollView } from "react-native"
import { router } from "expo-router"
import type { HKWorkoutActivityType } from "expo-workoutkit"
import { SunIcon, MoonIcon } from "react-native-heroicons/outline"

import { ActivityCard } from "@/components/ActivityCard"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"

export const ACTIVITY_CATEGORIES = {
  cardio: [
    { value: "running", label: "Running", icon: "🏃‍♂️", color: "#FF6B6B" },
    { value: "cycling", label: "Cycling", icon: "🚴‍♂️", color: "#4ECDC4" },
    { value: "swimming", label: "Swimming", icon: "🏊‍♂️", color: "#45B7D1" },
    { value: "walking", label: "Walking", icon: "🚶‍♂️", color: "#96CEB4" },
    { value: "mixedCardio", label: "Mixed Cardio", icon: "💪", color: "#FECA57" },
  ],
  strength: [
    { value: "strengthTraining", label: "Strength", icon: "🏋️‍♂️", color: "#FF9FF3" },
    { value: "yoga", label: "Yoga", icon: "🧘‍♀️", color: "#A8E6CF" },
    { value: "pilates", label: "Pilates", icon: "🤸‍♀️", color: "#FFD93D" },
    { value: "crossTraining", label: "Cross Training", icon: "⚡", color: "#FF6B9D" },
  ],
  sports: [
    { value: "tennis", label: "Tennis", icon: "🎾", color: "#6C5CE7" },
    { value: "basketball", label: "Basketball", icon: "🏀", color: "#FD79A8" },
    { value: "soccer", label: "Soccer", icon: "⚽", color: "#00B894" },
    { value: "boxing", label: "Boxing", icon: "🥊", color: "#E17055" },
  ],
}

export const getActivityEmoji = (activity: string) => {
  const activityCategory = Object.values(ACTIVITY_CATEGORIES).find((category) =>
    category.some((a) => a.value === activity),
  )
  const activityIcon = activityCategory?.find((a) => a.value === activity)?.icon
  if (!activityIcon) return "🏃‍♂️‍➡️"

  return activityIcon
}

export const ActivitySelectionScreen: FC = function ActivitySelectionScreen() {
  const { themeContext, setThemeContextOverride, theme } = useAppTheme()

  const handleActivitySelect = (activity: HKWorkoutActivityType) => {
    router.push({
      pathname: "/(tabs)/builder/configure",
      params: {
        activity,
      },
    })
  }

  const toggleTheme = () => {
    setThemeContextOverride(themeContext === "dark" ? "light" : "dark")
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <View style={$header}>
        <View style={$headerTop}>
          <View style={$headerText}>
            <Text preset="heading">Choose Your Activity</Text>
            <Text preset="subheading">Select the type of workout you want to create</Text>
          </View>
          <Button preset="ghost" style={$themeToggleButton} onPress={toggleTheme}>
            {themeContext === "dark" ? (
              <SunIcon size={20} color={theme.colors.text} />
            ) : (
              <MoonIcon size={20} color={theme.colors.text} />
            )}
          </Button>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        {Object.entries(ACTIVITY_CATEGORIES).map(([category, activities]) => (
          <View key={category} style={$activityCategory}>
            <Text preset="subheading">{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
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
      </ScrollView>
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
}

const $scrollContent: ViewStyle = {
  paddingVertical: 40,
  paddingHorizontal: 24,
}

const $header: ViewStyle = {
  paddingHorizontal: 24,
}

const $headerTop: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
}

const $headerText: ViewStyle = {
  flex: 1,
}

const $themeToggleButton: ViewStyle = {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
}

const $activityCategory: ViewStyle = {
  marginBottom: 24,
}

const $activityGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
}
