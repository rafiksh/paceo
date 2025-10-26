import { Stack } from "expo-router"

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="configure" />
      <Stack.Screen name="day/[date]" />
      <Stack.Screen
        name="workout/[id]"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  )
}
