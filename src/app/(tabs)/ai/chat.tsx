import { FC, useEffect, useRef, useState } from "react"
import { Alert, ScrollView, View, ViewStyle, TextStyle } from "react-native"
import { useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"
import OpenAI from "openai"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { WorkoutStorage } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import { radius } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"
import { WorkoutParser, type ParsedWorkout } from "@/utils/WorkoutParser"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const AIConversation: FC = () => {
  const router = useRouter()
  const { themed } = useAppTheme()
  const [apiKey, setApiKey] = useState("")
  const [hasApiKey, setHasApiKey] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pendingWorkout, setPendingWorkout] = useState<ParsedWorkout | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const savedKey = await SecureStore.getItemAsync("paceo_openai_key")
        if (savedKey) {
          setApiKey(savedKey)
          setHasApiKey(true)
        } else {
          router.replace("/(tabs)/ai")
        }
      } catch {
        router.replace("/(tabs)/ai")
      }
    })()
  }, [router])

  const resetApiKey = async () => {
    try {
      await SecureStore.deleteItemAsync("paceo_openai_key")
      setApiKey("")
      setHasApiKey(false)
      setMessages([])
      router.replace("/(tabs)/ai")
    } catch {
      Alert.alert("Error", "Failed to reset API key")
    }
  }

  const clearChat = () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear all messages?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => setMessages([]) },
    ])
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    try {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

      const isWorkoutRequest =
        inputText.toLowerCase().includes("workout") ||
        inputText.toLowerCase().includes("exercise") ||
        inputText.toLowerCase().includes("training") ||
        inputText.toLowerCase().includes("routine")

      const isSaveIntent = /\b(save(\sit|\sthis|\sthat|\sworkout)?)\b/i.test(inputText)
      if (isSaveIntent && pendingWorkout) {
        await saveWorkout()
        return
      }

      const systemPrompt = isWorkoutRequest
        ? "You are a helpful AI assistant for a fitness app called Paceo. When users ask for workouts, create detailed workout plans in the specified JSON format. For other questions, provide helpful fitness advice."
        : "You are a helpful AI assistant for a fitness app called Paceo. Help users with workout planning, fitness advice, and health-related questions."

      const userPrompt = isWorkoutRequest
        ? WorkoutParser.getWorkoutCreationPrompt(inputText.trim())
        : inputText.trim()

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      const assistantResponse =
        response.choices[0]?.message?.content || "Sorry, I couldn't generate a response."

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (isWorkoutRequest && WorkoutParser.containsWorkoutData(assistantResponse)) {
        const parsedWorkout = WorkoutParser.parseWorkoutFromAI(assistantResponse)
        if (parsedWorkout) setPendingWorkout(parsedWorkout)
      }
    } catch (error) {
      console.error("OpenAI API Error:", error)
      let friendly = "Failed to get response from AI. Please try again."
      if (error instanceof Error) {
        if (error.message.includes("429") || error.message.includes("quota")) {
          friendly = "OpenAI API quota exceeded. Please try again later."
        } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
          friendly = "Invalid API key. Please check your OpenAI API key."
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          friendly = "Network error. Please check your connection."
        }
      }
      setErrorMessage(friendly)
    } finally {
      setIsLoading(false)
    }
  }

  const saveWorkout = async () => {
    if (!pendingWorkout) return
    try {
      const savedWorkout = {
        id: WorkoutStorage.generateId(),
        name: pendingWorkout.name,
        workoutPlan: pendingWorkout.workoutPlan,
        createdAt: new Date(),
        activity: pendingWorkout.activity,
        location: pendingWorkout.location,
      }
      await WorkoutStorage.saveWorkout(savedWorkout)
      setPendingWorkout(null)
      Alert.alert("Success", `Workout "${pendingWorkout.name}" saved successfully!`)
    } catch (e) {
      console.error("Error saving workout:", e)
      setErrorMessage("Failed to save workout")
    }
  }

  const dismissWorkout = () => setPendingWorkout(null)

  if (!hasApiKey) {
    return null
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <View style={themed($header)}>
        <View style={$headerTitle}>
          <Text preset="heading">AI Assistant</Text>
          <Text preset="formHelper">Ask about fitness, workouts and health</Text>
        </View>
        <View style={$headerActions}>
          <Button preset="default" text="Clear" onPress={clearChat} style={$smallAction} />
          <Button preset="reversed" text="Reset" onPress={resetApiKey} style={$smallAction} />
        </View>
      </View>

      {errorMessage ? (
        <View style={$errorBanner}>
          <Text preset="formHelper" style={$errorText}>
            {errorMessage}
          </Text>
          <View style={$errorActions}>
            <Button
              preset="default"
              text="Dismiss"
              onPress={() => setErrorMessage(null)}
              style={$smallAction}
            />
          </View>
        </View>
      ) : null}

      <ScrollView
        ref={scrollViewRef}
        style={$messagesContainer}
        contentContainerStyle={$messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={$emptyState}>
            <Text preset="heading" size="md">
              How can I help today?
            </Text>
            <Text preset="formHelper" size="sm" style={$emptySubtitle}>
              Try one of these to get started
            </Text>
            <View style={$suggestionsRow}>
              {[
                "Build a 30-min outdoor run",
                "Plan a strength routine (dumbbells)",
                "Weekly 5K improvement plan",
                "Recovery workout for sore legs",
              ].map((label) => (
                <Button
                  key={label}
                  preset="default"
                  onPress={() => {
                    setInputText(label)
                  }}
                  style={$chip}
                  textStyle={$chipText}
                >
                  <Text preset="default" size="xs">
                    {label}
                  </Text>
                </Button>
              ))}
            </View>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                $messageContainer,
                message.role === "user" ? $userMessage : $assistantMessage,
              ]}
            >
              <Text
                preset="default"
                size="sm"
                style={message.role === "user" ? $userText : $assistantText}
              >
                {message.content}
              </Text>
              <Text
                preset="formHelper"
                size="xxs"
                style={[$messageTime, message.role === "user" ? $userTime : $assistantTime]}
              >
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          ))
        )}

        {isLoading && (
          <View style={[$messageContainer, $assistantMessage]}>
            <Text preset="default" size="sm">
              Thinking...
            </Text>
          </View>
        )}

        {pendingWorkout && (
          <View style={$workoutConfirmation}>
            <Text preset="bold" size="lg" style={$workoutTitle}>
              🎯 Workout Created!
            </Text>
            <Text preset="subheading" size="md" style={$workoutName}>
              {pendingWorkout.name}
            </Text>
            <Text preset="formHelper" size="sm" style={$workoutDetails}>
              {pendingWorkout.activity} • {pendingWorkout.location}
            </Text>
            <View style={$workoutActions}>
              <Button text="Save Workout" onPress={saveWorkout} style={$saveWorkoutButton} />
              <Button text="Dismiss" onPress={dismissWorkout} style={$dismissButton} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={$composerWrapper}>
        <View style={$inputContainer}>
          <View style={$inputRow}>
            <View style={$messageInput}>
              <TextField
                placeholder="Ask me anything about fitness..."
                value={inputText}
                onChangeText={setInputText}
                maxLength={500}
                RightAccessory={() => (
                  <Button
                    text="Send"
                    onPress={sendMessage}
                    disabled={!inputText.trim() || isLoading}
                    preset="filled"
                    style={$sendButton}
                  />
                )}
              />
            </View>
          </View>
        </View>
      </View>
    </Screen>
  )
}

export default AIConversation

const $container: ViewStyle = { flex: 1 }

const $headerActions: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
}

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
})

const $headerTitle: ViewStyle = { flex: 1, paddingVertical: 8 }

const $messagesContainer: ViewStyle = { flex: 1, paddingHorizontal: 16, paddingTop: 8 }

const $messagesContent: ViewStyle = { paddingVertical: 12, paddingBottom: 108 }

const $emptyState: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 60,
}

const $emptySubtitle: TextStyle = { textAlign: "center", lineHeight: 20, marginTop: 16 }

const $messageContainer: ViewStyle = {
  marginBottom: 10,
  padding: 12,
  borderRadius: radius.md,
  maxWidth: "85%",
}

const $userMessage: ViewStyle = {
  backgroundColor: colors.tint,
  alignSelf: "flex-end",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
  borderTopLeftRadius: radius.lg,
  borderTopRightRadius: radius.lg,
  borderBottomLeftRadius: radius.md,
  borderBottomRightRadius: radius.sm,
}

const $assistantMessage: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  alignSelf: "flex-start",
  borderWidth: 1,
  borderColor: colors.border,
  borderTopLeftRadius: radius.lg,
  borderTopRightRadius: radius.lg,
  borderBottomRightRadius: radius.md,
  borderBottomLeftRadius: radius.sm,
}

const $messageTime: TextStyle = { marginTop: 4, textAlign: "right" }

const $userText: TextStyle = { color: colors.palette.neutral100 }

const $assistantText: TextStyle = { color: colors.text }

const $userTime: TextStyle = { color: colors.palette.neutral100, opacity: 0.8 }

const $assistantTime: TextStyle = { color: colors.textDim }

const $errorBanner: ViewStyle = {
  marginHorizontal: 16,
  marginTop: 8,
  padding: 12,
  borderRadius: radius.md,
  backgroundColor: colors.palette.angry100,
  borderWidth: 1,
  borderColor: colors.palette.angry500,
}

const $errorText: TextStyle = { color: colors.palette.angry500 }

const $errorActions: ViewStyle = { marginTop: 8, alignItems: "flex-end" }

const $composerWrapper: ViewStyle = { padding: 12 }

const $inputContainer: ViewStyle = {
  padding: 8,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.background,
  borderRadius: radius.lg,
}

const $inputRow: ViewStyle = { flexDirection: "row", alignItems: "flex-end", gap: 12 }

const $messageInput: ViewStyle = { flex: 1, minHeight: 40, maxHeight: 120 }

const $workoutConfirmation: ViewStyle = {
  marginHorizontal: 16,
  marginVertical: 12,
  padding: 16,
  backgroundColor: colors.palette.neutral100,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
}

const $workoutTitle: TextStyle = { textAlign: "center", marginBottom: 8 }

const $workoutName: TextStyle = { textAlign: "center", marginBottom: 4 }

const $workoutDetails: TextStyle = {
  textAlign: "center",
  marginBottom: 16,
  textTransform: "capitalize",
}

const $workoutActions: ViewStyle = { flexDirection: "row", gap: 12 }

const $saveWorkoutButton: ViewStyle = { flex: 1, backgroundColor: colors.palette.neutral100 }

const $dismissButton: ViewStyle = {
  flex: 1,
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: colors.palette.neutral100,
}

const $sendButton: ViewStyle = {
  minWidth: 80,
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
}

const $smallAction: ViewStyle = { minHeight: 36, paddingHorizontal: 12 }

const $suggestionsRow: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
}

const $chip: ViewStyle = {
  borderRadius: 16,
  paddingVertical: 6,
  paddingHorizontal: 12,
  backgroundColor: colors.palette.neutral200,
}

const $chipText: TextStyle = { color: colors.text }
