import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"

import { Button } from "@/components/Button"
import { PacerGoalSelector } from "@/components/PacerGoalSelector"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
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
  const { themed } = useAppTheme()
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
    <View style={themed($container)}>
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
              containerStyle={themed($nameInputContainer)}
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
        <Text preset="formHelper" size="xs" style={themed($errorText)}>
          {errors.distance?.message || errors.time?.message}
        </Text>
      )}

      {/* Submit Button */}
      <Button
        text={!isValid ? "Complete Configuration" : "Save Pacer Workout"}
        preset={!isValid ? "primary" : "default"}
        onPress={handleSubmit(onSubmit)}
        style={themed($submitButton)}
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

const $submitButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $errorText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.error,
  marginTop: 4,
})
