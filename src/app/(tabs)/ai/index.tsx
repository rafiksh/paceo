import { useEffect, useState } from "react"
import { Alert, View, ViewStyle, TextStyle } from "react-native"
import { useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import { radius, spacing } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"

export default function AISetup() {
  const router = useRouter()
  const { themed } = useAppTheme()
  const [apiKey, setApiKey] = useState("")
  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const savedKey = await SecureStore.getItemAsync("paceo_openai_key")
        if (savedKey) {
          setApiKey(savedKey)
          setHasApiKey(true)
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    if (hasApiKey) {
      router.replace("/(tabs)/ai/chat")
    }
  }, [hasApiKey, router])

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert("Error", "Please enter your OpenAI API key")
      return
    }
    try {
      await SecureStore.setItemAsync("paceo_openai_key", apiKey.trim())
      setHasApiKey(true)
    } catch {
      Alert.alert("Error", "Failed to save API key")
    }
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]}>
      <View style={themed($header)}>
        <Text preset="heading">AI Assistant</Text>
        <Text preset="formHelper" style={$subtitle}>
          Get personalized fitness advice
        </Text>
      </View>

      <View style={$apiKeySection}>
        <Text preset="subheading">OpenAI API Key</Text>
        <Text preset="formHelper">
          Enter your OpenAI API key to start chatting with our AI assistant. Your key is stored
          securely using device encryption and never leaves your device.
        </Text>

        <TextField placeholder="sk-..." value={apiKey} onChangeText={setApiKey} secureTextEntry />

        <Button text="Save API Key" onPress={saveApiKey} />

        <View style={$infoSection}>
          <Text preset="subheading">How to get your API key:</Text>
          <Text preset="formHelper" size="sm">
            1. Visit platform.openai.com
          </Text>
          <Text preset="formHelper" size="sm">
            2. Sign up or log in
          </Text>
          <Text preset="formHelper" size="sm">
            3. Go to API Keys section
          </Text>
          <Text preset="formHelper" size="sm">
            4. Create a new secret key
          </Text>
          <Text preset="formHelper" size="sm">
            5. Copy and paste it here
          </Text>
        </View>
      </View>
    </Screen>
  )
}

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
})

const $subtitle: TextStyle = {
  marginTop: 4,
}

const $apiKeySection: ViewStyle = {
  padding: spacing.lg,
  borderRadius: radius.lg,
  gap: spacing.md,
}

const $infoSection: ViewStyle = {
  gap: spacing.xs,
}
