import { useState } from "react"
import { View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { WelcomeScreen } from "@/screens/WelcomeScreen"
import { WorkoutScreen } from "@/screens/WorkoutScreen"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export default function Index() {
  const { themed } = useAppTheme()
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "workout">("workout")

  return (
    <View style={themed($container)}>
      <View style={themed($navigationContainer)}>
        <Button
          text="Welcome"
          onPress={() => setCurrentScreen("welcome")}
          style={themed([$navButton, currentScreen === "welcome" && $activeNavButton])}
        />
        <Button
          text="Workout"
          onPress={() => setCurrentScreen("workout")}
          style={themed([$navButton, currentScreen === "workout" && $activeNavButton])}
        />
      </View>

      {currentScreen === "welcome" ? <WelcomeScreen /> : <WorkoutScreen />}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $navigationContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  gap: spacing.sm,
})

const $navButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral200,
})

const $activeNavButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
})
