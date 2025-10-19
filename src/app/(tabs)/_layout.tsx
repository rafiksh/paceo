import { Tabs } from "expo-router"
import {
  WrenchScrewdriverIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
} from "react-native-heroicons/outline"
import {
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
} from "react-native-heroicons/solid"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export default function TabLayout() {
  const { themed, theme } = useAppTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: themed($tabBarStyle),
        tabBarLabelStyle: themed($tabBarLabelStyle),
        tabBarActiveTintColor: theme.colors.tint,
        tabBarInactiveTintColor: theme.colors.textDim,
      }}
    >
      <Tabs.Screen
        name="builder"
        options={{
          title: "Builder",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon
              Icon={focused ? WrenchScrewdriverIconSolid : WrenchScrewdriverIcon}
              color={color}
              size={size}
            />
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
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon
              Icon={focused ? ChatBubbleLeftRightIconSolid : ChatBubbleLeftRightIcon}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  )
}

// Enhanced tab icon component
function TabIcon({
  Icon,
  color,
  size,
}: {
  Icon: React.ComponentType<{ color: string; size: number }>
  color: string
  size: number
}) {
  return <Icon size={size} color={color} />
}

// Styles
const $tabBarStyle: ThemedStyle<any> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopColor: colors.border,
  borderTopWidth: 1,
  paddingHorizontal: spacing.lg,
  // Ensure proper contrast in dark mode
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: -1 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 8,
})

const $tabBarLabelStyle: ThemedStyle<any> = ({ typography }) => ({
  fontSize: 12,
  fontWeight: "600",
  fontFamily: typography.primary.semiBold,
  marginTop: 4,
})
