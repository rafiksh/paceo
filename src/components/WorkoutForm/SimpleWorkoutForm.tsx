import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"

import { Button } from "@/components/Button"
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
      <Button
        text={!isValid ? "Complete Configuration" : "Save Simple Workout"}
        preset={!isValid ? "primary" : "default"}
        onPress={handleSubmit(onSubmit)}
        style={$submitButton}
        disabled={!isValid}
      />
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
}

const $nameInputContainer: ViewStyle = {
  marginBottom: 0,
}

const $submitButton: ViewStyle = {
  marginTop: 24,
}

const $errorText = {
  color: colors.error,
  marginTop: 4,
}
