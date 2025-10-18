import { Stack } from "expo-router"

export default function SavedLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  )
}
