import { Stack } from "expo-router"

export default function AILayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="chat" />
      <Stack.Screen name="index" />
    </Stack>
  )
}
