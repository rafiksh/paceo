import { Stack } from "expo-router"

export default function BuilderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" />
      <Stack.Screen name="configure" />
    </Stack>
  )
}
