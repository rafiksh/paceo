import { View } from "react-native"
import { Tabs } from "expo-router"

import { colors } from "@/theme/colors"
import { typography } from "@/theme/typography"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "500",
          fontFamily: typography.primary.medium,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textDim,
      }}
    >
      <Tabs.Screen
        name="builder"
        options={{
          title: "Builder",
          tabBarIcon: ({ color, size }) => <TabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => <TabIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}

// Simple tab icon component
function TabIcon({ color, size }: { color: string; size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 2,
      }}
    />
  )
}
