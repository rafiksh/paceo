import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"

import { CustomWorkoutBuilder } from "@/components/CustomWorkoutBuilder"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"
import { customWorkoutSchema, type CustomWorkoutFormData } from "@/types/WorkoutFormData"

import { ButtonSelector } from "./ButtonSelector"
import { FormSection } from "./FormSection"

interface CustomWorkoutFormProps {
  onSubmit: (data: CustomWorkoutFormData) => void
  initialData?: Partial<CustomWorkoutFormData>
}

const LOCATIONS = [
  { key: "indoor", label: "Indoor" },
  { key: "outdoor", label: "Outdoor" },
  { key: "unknown", label: "Unknown" },
]

export const CustomWorkoutForm: FC<CustomWorkoutFormProps> = ({ onSubmit, initialData }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CustomWorkoutFormData>({
    resolver: zodResolver(customWorkoutSchema),
    defaultValues: {
      workoutName: "",
      selectedLocation: "outdoor",
      customWorkout: undefined,
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

      {/* Custom Workout Builder */}
      <Controller
        control={control}
        name="customWorkout"
        render={({ field: { onChange, value } }) => (
          <CustomWorkoutBuilder workout={value || null} onWorkoutChange={onChange} />
        )}
      />
      {errors.customWorkout && (
        <Text preset="formHelper" size="xs" style={$errorText}>
          {errors.customWorkout.message}
        </Text>
      )}

      {/* Submit Button */}
      <View style={$submitContainer}>
        <CustomWorkoutSubmitButton onPress={handleSubmit(onSubmit)} disabled={!isValid} />
      </View>
    </View>
  )
}

// Custom submit button component
interface CustomWorkoutSubmitButtonProps {
  onPress: () => void
  disabled: boolean
}

const CustomWorkoutSubmitButton: FC<CustomWorkoutSubmitButtonProps> = ({ onPress, disabled }) => {
  return (
    <View style={$submitButton}>
      <Text
        preset="formLabel"
        size="md"
        style={[$submitButtonText, disabled && $submitButtonTextDisabled]}
        onPress={disabled ? undefined : onPress}
      >
        {disabled ? "Complete Configuration" : "Save Custom Workout"}
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
