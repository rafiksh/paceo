import { Stack } from "expo-router"

export default function SavedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" />
      <Stack.Screen
        name="preview"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  )
}
