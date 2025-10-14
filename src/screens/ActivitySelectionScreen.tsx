import { FC } from "react"
import { View, ViewStyle, ScrollView } from "react-native"
import type { TextStyle } from "react-native"
import { router } from "expo-router"
import type { HKWorkoutActivityType } from "expo-workoutkit"

import { ActivityCard } from "@/components/ActivityCard"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

// Activity categories
const ACTIVITY_CATEGORIES = {
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

export const ActivitySelectionScreen: FC = function ActivitySelectionScreen() {
  const handleActivitySelect = (activity: HKWorkoutActivityType) => {
    // Navigate to workout type selection with activity, staying within tabs
    router.push({
      pathname: "/(tabs)/builder/configure",
      params: {
        activity,
      },
    })
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        {/* Header */}
        <View style={$header}>
          <Text style={$title}>Choose Your Activity</Text>
          <Text style={$subtitle}>Select the type of workout you want to create</Text>
        </View>

        {/* Activity Selection */}
        <View style={$section}>
          <Text style={$sectionTitle}>Activity Type</Text>
          {Object.entries(ACTIVITY_CATEGORIES).map(([category, activities]) => (
            <View key={category} style={$activityCategory}>
              <Text style={$categoryTitle}>
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
    </Screen>
  )
}

// Styles
const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $scrollContent: ViewStyle = {
  paddingBottom: 40,
}

const $header: ViewStyle = {
  paddingHorizontal: 24,
  paddingVertical: 40,
  alignItems: "center",
}

const $title: TextStyle = {
  fontSize: 32,
  fontWeight: "800",
  color: colors.text,
  fontFamily: typography.primary.bold,
  marginBottom: 8,
  letterSpacing: -0.5,
}

const $subtitle: TextStyle = {
  fontSize: 16,
  fontWeight: "400",
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
}

const $section: ViewStyle = {
  paddingHorizontal: 24,
  marginBottom: 32,
}

const $sectionTitle: TextStyle = {
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
  fontFamily: typography.primary.bold,
  marginBottom: 20,
  letterSpacing: -0.3,
}

// Activity Styles
const $activityCategory: ViewStyle = {
  marginBottom: 24,
}

const $categoryTitle: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  marginBottom: 12,
  textTransform: "capitalize",
}

const $activityGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
}
