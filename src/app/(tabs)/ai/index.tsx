import { useEffect, useState } from "react"
import { Alert, View, ViewStyle, TextStyle, ScrollView } from "react-native"
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
  const [model, setModel] = useState<string>("gpt-5-nano")

  useEffect(() => {
    ;(async () => {
      try {
        const savedKey = await SecureStore.getItemAsync("paceo_openai_key")
        if (savedKey) {
          setApiKey(savedKey)
          setHasApiKey(true)
        }
        const savedModel = await SecureStore.getItemAsync("paceo_openai_model")
        if (savedModel) setModel(savedModel)
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
      await SecureStore.setItemAsync("paceo_openai_model", model)
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

      <ScrollView contentContainerStyle={themed($apiKeySection)}>
        <Text preset="subheading">OpenAI API Key</Text>
        <Text preset="formHelper">
          Enter your OpenAI API key to start chatting with our AI assistant. Your key is stored
          securely using device encryption and never leaves your device.
        </Text>

        <TextField placeholder="sk-..." value={apiKey} onChangeText={setApiKey} secureTextEntry />

        <Button text="Save API Key" onPress={saveApiKey} />

        <View style={$modelSection}>
          <Text preset="subheading">Model</Text>
          <Text preset="formHelper" size="sm" style={$modelHint}>
            Choose the model used for responses
          </Text>
          <View style={$modelRow}>
            {(
              [
                "gpt-5",
                "gpt-5-mini",
                "gpt-5-nano",
                "gpt-4.1",
                "gpt-4.1-mini",
                "gpt-4o",
                "gpt-4o-mini",
                "gpt-3.5-turbo",
              ] as const
            ).map((m) => (
              <Button
                key={m}
                preset={model === m ? "filled" : "default"}
                onPress={async () => {
                  setModel(m)
                  try {
                    await SecureStore.setItemAsync("paceo_openai_model", m)
                  } catch {}
                }}
                style={$modelChip}
              >
                <Text preset="default" size="xs">
                  {m}
                </Text>
              </Button>
            ))}
          </View>
        </View>

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
      </ScrollView>
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

const $modelSection: ViewStyle = {
  marginTop: spacing.md,
  gap: spacing.xs,
}

const $modelHint: TextStyle = {
  opacity: 0.8,
}

const $modelRow: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
}

const $modelChip: ViewStyle = {
  borderRadius: 16,
  paddingVertical: 6,
  paddingHorizontal: 12,
}
