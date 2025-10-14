import { Tabs } from "expo-router"
import { HomeIcon, BookmarkIcon } from "react-native-heroicons/outline"
import {
  HomeIcon as HomeIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from "react-native-heroicons/solid"

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
          height: 80,
          paddingBottom: 20,
          paddingTop: 12,
          paddingHorizontal: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          fontFamily: typography.primary.semiBold,
          marginTop: 4,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textDim,
      }}
    >
      <Tabs.Screen
        name="builder"
        options={{
          title: "Builder",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon Icon={focused ? HomeIconSolid : HomeIcon} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon Icon={focused ? BookmarkIconSolid : BookmarkIcon} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}

// Enhanced tab icon component
function TabIcon({ Icon, color, size }: { Icon: any; color: string; size: number }) {
  return <Icon size={size} color={color} strokeWidth={2} />
}
