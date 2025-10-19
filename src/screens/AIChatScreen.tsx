import { FC, useState, useRef, useEffect } from "react"
import { View, ViewStyle, ScrollView, Alert, TextStyle } from "react-native"
import * as SecureStore from "expo-secure-store"
import OpenAI from "openai"
import { ChatBubbleLeftRightIcon } from "react-native-heroicons/outline"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { WorkoutStorage } from "@/services/WorkoutStorage"
import { colors } from "@/theme/colors"
import { radius } from "@/theme/spacing"
import { WorkoutParser, type ParsedWorkout } from "@/utils/WorkoutParser"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export const AIChatScreen: FC = () => {
  const [apiKey, setApiKey] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [pendingWorkout, setPendingWorkout] = useState<ParsedWorkout | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    // Load saved API key
    loadApiKey()
  }, [])

  const loadApiKey = async () => {
    try {
      const savedKey = await SecureStore.getItemAsync("paceo_openai_key")
      if (savedKey) {
        setApiKey(savedKey)
        setHasApiKey(true)
      }
    } catch {
      console.log("No saved API key found")
    }
  }

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert("Error", "Please enter your OpenAI API key")
      return
    }

    try {
      await SecureStore.setItemAsync("paceo_openai_key", apiKey.trim())
      setHasApiKey(true)
      Alert.alert("Success", "API key saved securely!")
    } catch {
      Alert.alert("Error", "Failed to save API key")
    }
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
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Only for development
      })

      // Check if user is asking for a workout
      const isWorkoutRequest =
        inputText.toLowerCase().includes("workout") ||
        inputText.toLowerCase().includes("exercise") ||
        inputText.toLowerCase().includes("training") ||
        inputText.toLowerCase().includes("routine")

      const systemPrompt = isWorkoutRequest
        ? "You are a helpful AI assistant for a fitness app called Paceo. When users ask for workouts, create detailed workout plans in the specified JSON format. For other questions, provide helpful fitness advice."
        : "You are a helpful AI assistant for a fitness app called Paceo. Help users with workout planning, fitness advice, and health-related questions."

      const userPrompt = isWorkoutRequest
        ? WorkoutParser.getWorkoutCreationPrompt(inputText.trim())
        : inputText.trim()

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: "user",
            content: userPrompt,
          },
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

      // Check if the response contains workout data
      if (isWorkoutRequest && WorkoutParser.containsWorkoutData(assistantResponse)) {
        const parsedWorkout = WorkoutParser.parseWorkoutFromAI(assistantResponse)
        if (parsedWorkout) {
          setPendingWorkout(parsedWorkout)
        }
      }
    } catch (error) {
      console.error("OpenAI API Error:", error)

      let errorMessage = "Failed to get response from AI. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("429") || error.message.includes("quota")) {
          errorMessage = "OpenAI API quota exceeded. Please check your billing or try again later."
        } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
          errorMessage = "Invalid API key. Please check your OpenAI API key and try again."
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        }
      }

      Alert.alert("Error", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear all messages?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => setMessages([]) },
    ])
  }

  const resetApiKey = () => {
    Alert.alert("Reset API Key", "Are you sure you want to reset your API key?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          try {
            await SecureStore.deleteItemAsync("paceo_openai_key")
            setApiKey("")
            setHasApiKey(false)
            setMessages([])
          } catch {
            Alert.alert("Error", "Failed to reset API key")
          }
        },
      },
    ])
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
    } catch (error) {
      console.error("Error saving workout:", error)
      Alert.alert("Error", "Failed to save workout")
    }
  }

  const dismissWorkout = () => {
    setPendingWorkout(null)
  }

  if (!hasApiKey) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={$headerContainer}>
          <View style={$header}>
            <ChatBubbleLeftRightIcon size={32} color={colors.tint} />
            <View style={$titleContainer}>
              <Text preset="heading" size="xl">
                AI Assistant
              </Text>
              <Text preset="formHelper" size="sm" style={$subtitle}>
                Get personalized fitness advice
              </Text>
            </View>
          </View>

          <View style={$apiKeySection}>
            <Text preset="subheading" size="lg">
              OpenAI API Key
            </Text>
            <Text preset="formHelper" size="sm" style={$description}>
              Enter your OpenAI API key to start chatting with our AI assistant. Your key is stored
              securely using device encryption and never leaves your device.
            </Text>

            <TextField
              placeholder="sk-..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
            />

            <Button text="Save API Key" onPress={saveApiKey} />
          </View>

          <View style={$infoSection}>
            <Text preset="subheading" size="md">
              How to get your API key:
            </Text>
            <Text preset="formHelper" size="sm" style={$infoText}>
              1. Visit platform.openai.com
            </Text>
            <Text preset="formHelper" size="sm" style={$infoText}>
              2. Sign up or log in
            </Text>
            <Text preset="formHelper" size="sm" style={$infoText}>
              3. Go to API Keys section
            </Text>
            <Text preset="formHelper" size="sm" style={$infoText}>
              4. Create a new secret key
            </Text>
            <Text preset="formHelper" size="sm" style={$infoText}>
              5. Copy and paste it here
            </Text>
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <View style={$header}>
        <Text preset="subheading" size="lg">
          AI Assistant
        </Text>
        <View style={$headerActions}>
          <Button text="Clear" onPress={clearChat} preset="filled" />
          <Button text="Reset API Key" onPress={resetApiKey} preset="reversed" />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={$messagesContainer}
        contentContainerStyle={$messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={$emptyState}>
            <ChatBubbleLeftRightIcon size={48} color={colors.textDim} />
            <Text preset="subheading" size="lg">
              Start a conversation
            </Text>
            <Text preset="formHelper" size="sm" style={$emptySubtitle}>
              Ask me anything about fitness, workouts, or health!
            </Text>
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
              <Text preset="default" size="sm">
                {message.content}
              </Text>
              <Text preset="formHelper" size="xxs" style={$messageTime}>
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

        {/* Workout Confirmation */}
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
                  preset="ghost"
                  style={$sendButton}
                />
              )}
            />
          </View>
        </View>
      </View>
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
}

const $headerContainer: ViewStyle = {
  flex: 1,
  padding: 20,
}

const $headerActions: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
}

const $header: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

const $titleContainer: ViewStyle = {
  flex: 1,
  marginLeft: 12,
}

const $subtitle: TextStyle = {
  marginTop: 4,
}

const $apiKeySection: ViewStyle = {
  marginTop: 32,
  padding: 20,
  backgroundColor: colors.background,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
}

const $description: TextStyle = {
  lineHeight: 20,
  marginBottom: 20,
}

const $infoSection: ViewStyle = {
  marginTop: 24,
  padding: 16,
  backgroundColor: colors.palette.neutral200,
  borderRadius: radius.md,
}

const $infoText: TextStyle = {
  marginBottom: 4,
}

const $messagesContainer: ViewStyle = {
  flex: 1,
  paddingHorizontal: 20,
}

const $messagesContent: ViewStyle = {
  paddingVertical: 16,
  paddingBottom: 20,
  flexGrow: 1,
  flex: 1,
}

const $emptyState: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 60,
}

const $emptySubtitle: TextStyle = {
  textAlign: "center",
  lineHeight: 20,
  marginTop: 16,
}

const $messageContainer: ViewStyle = {
  marginBottom: 12,
  padding: 16,
  borderRadius: radius.md,
  maxWidth: "85%",
}

const $userMessage: ViewStyle = {
  backgroundColor: colors.tint,
  alignSelf: "flex-end",
}

const $assistantMessage: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  alignSelf: "flex-start",
}

const $messageTime: TextStyle = {
  marginTop: 4,
  textAlign: "right",
}

const $inputContainer: ViewStyle = {
  padding: 20,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  backgroundColor: colors.background,
}

const $inputRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-end",
  gap: 12,
}

const $messageInput: ViewStyle = {
  flex: 1,
  minHeight: 40,
  maxHeight: 120,
}

// Workout Confirmation Styles
const $workoutConfirmation: ViewStyle = {
  marginHorizontal: 20,
  marginVertical: 12,
  padding: 20,
  backgroundColor: colors.tint,
  borderRadius: radius.lg,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}

const $workoutTitle: TextStyle = {
  color: colors.palette.neutral100,
  textAlign: "center",
  marginBottom: 8,
}

const $workoutName: TextStyle = {
  color: colors.palette.neutral100,
  textAlign: "center",
  marginBottom: 4,
}

const $workoutDetails: TextStyle = {
  color: colors.palette.neutral200,
  textAlign: "center",
  marginBottom: 16,
  textTransform: "capitalize",
}

const $workoutActions: ViewStyle = {
  flexDirection: "row",
  gap: 12,
}

const $saveWorkoutButton: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.neutral100,
}

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
