import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"

import { PacerGoalSelector } from "@/components/PacerGoalSelector"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"
import { pacerWorkoutSchema, type PacerWorkoutFormData } from "@/types/WorkoutFormData"

import { ButtonSelector } from "./ButtonSelector"
import { FormSection } from "./FormSection"

interface PacerWorkoutFormProps {
  onSubmit: (data: PacerWorkoutFormData) => void
  initialData?: Partial<PacerWorkoutFormData>
}

const LOCATIONS = [
  { key: "indoor", label: "Indoor" },
  { key: "outdoor", label: "Outdoor" },
  { key: "unknown", label: "Unknown" },
]

export const PacerWorkoutForm: FC<PacerWorkoutFormProps> = ({ onSubmit, initialData }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PacerWorkoutFormData>({
    resolver: zodResolver(pacerWorkoutSchema),
    defaultValues: {
      workoutName: "",
      selectedLocation: "outdoor",
      distance: {
        value: undefined,
        unit: undefined,
      },
      time: {
        value: undefined,
        unit: undefined,
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

      {/* Distance and Time Goals */}
      <Controller
        control={control}
        name="distance"
        render={({ field: { onChange: onDistanceChange, value: distanceValue } }) => (
          <Controller
            control={control}
            name="time"
            render={({ field: { onChange: onTimeChange, value: timeValue } }) => (
              <PacerGoalSelector
                distance={distanceValue}
                time={timeValue}
                onDistanceChange={onDistanceChange}
                onTimeChange={onTimeChange}
              />
            )}
          />
        )}
      />
      {(errors.distance || errors.time) && (
        <Text preset="formHelper" size="xs" style={$errorText}>
          {errors.distance?.message || errors.time?.message}
        </Text>
      )}

      {/* Submit Button */}
      <View style={$submitContainer}>
        <PacerWorkoutSubmitButton onPress={handleSubmit(onSubmit)} disabled={!isValid} />
      </View>
    </View>
  )
}

// Pacer submit button component
interface PacerWorkoutSubmitButtonProps {
  onPress: () => void
  disabled: boolean
}

const PacerWorkoutSubmitButton: FC<PacerWorkoutSubmitButtonProps> = ({ onPress, disabled }) => {
  return (
    <View style={$submitButton}>
      <Text
        preset="formLabel"
        size="md"
        style={[$submitButtonText, disabled && $submitButtonTextDisabled]}
        onPress={disabled ? undefined : onPress}
      >
        {disabled ? "Complete Configuration" : "Save Pacer Workout"}
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
