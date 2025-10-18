import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"

import { GoalSelector } from "@/components/GoalSelector"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"
import { simpleWorkoutSchema, type SimpleWorkoutFormData } from "@/types/WorkoutFormData"

import { ButtonSelector } from "./ButtonSelector"
import { FormSection } from "./FormSection"

interface SimpleWorkoutFormProps {
  onSubmit: (data: SimpleWorkoutFormData) => void
  initialData?: Partial<SimpleWorkoutFormData>
}

const LOCATIONS = [
  { key: "indoor", label: "Indoor" },
  { key: "outdoor", label: "Outdoor" },
  { key: "unknown", label: "Unknown" },
]

export const SimpleWorkoutForm: FC<SimpleWorkoutFormProps> = ({ onSubmit, initialData }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SimpleWorkoutFormData>({
    resolver: zodResolver(simpleWorkoutSchema),
    defaultValues: {
      workoutName: "",
      selectedLocation: "outdoor",
      goal: {
        type: "time",
        value: 30,
        unit: "min",
      },
      ...initialData,
    },
    mode: "onChange",
  })

  return (
    <View style={$container}>
      {/* Workout Name */}
      <FormSection title="Workout Name" error={errors.workoutName?.message}>
        <Controller
          control={control}
          name="workoutName"
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value}
              onChangeText={onChange}
              placeholder="Enter a name for your workout..."
              autoCapitalize="words"
              returnKeyType="done"
              containerStyle={$nameInputContainer}
            />
          )}
        />
      </FormSection>

      {/* Location Selection */}
      <FormSection title="Location" error={errors.selectedLocation?.message}>
        <Controller
          control={control}
          name="selectedLocation"
          render={({ field: { onChange, value } }) => (
            <ButtonSelector options={LOCATIONS} selectedValue={value} onValueChange={onChange} />
          )}
        />
      </FormSection>

      {/* Goal Configuration */}
      <Controller
        control={control}
        name="goal"
        render={({ field: { onChange, value } }) => (
          <GoalSelector goal={value as any} onGoalChange={onChange} />
        )}
      />
      {errors.goal && (
        <Text preset="formHelper" size="xs" style={$errorText}>
          {errors.goal.message}
        </Text>
      )}

      {/* Submit Button */}
      <View style={$submitContainer}>
        <SimpleWorkoutSubmitButton onPress={handleSubmit(onSubmit)} disabled={!isValid} />
      </View>
    </View>
  )
}

// Simple submit button component
interface SimpleWorkoutSubmitButtonProps {
  onPress: () => void
  disabled: boolean
}

const SimpleWorkoutSubmitButton: FC<SimpleWorkoutSubmitButtonProps> = ({ onPress, disabled }) => {
  return (
    <View style={$submitButton}>
      <Text
        preset="formLabel"
        size="md"
        style={[$submitButtonText, disabled && $submitButtonTextDisabled]}
        onPress={disabled ? undefined : onPress}
      >
        {disabled ? "Complete Configuration" : "Save Simple Workout"}
      </Text>
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
}

const $nameInputContainer: ViewStyle = {
  marginBottom: 0,
}

const $submitContainer: ViewStyle = {
  marginTop: 24,
  paddingVertical: 16,
}

const $submitButton: ViewStyle = {
  backgroundColor: colors.tint,
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  opacity: 1,
}

const $submitButtonText = {
  color: colors.palette.neutral100,
}

const $submitButtonTextDisabled = {
  opacity: 0.6,
}

const $errorText = {
  color: colors.error,
  marginTop: 4,
}
