import { useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import type { WorkoutPlan } from "expo-workoutkit"
import { SafeAreaView } from "react-native-safe-area-context"

import { Button } from "@/components/Button"
import { DatePickerModal } from "@/components/DatePickerModal"
import { Text } from "@/components/Text"
import { WorkoutHeader } from "@/components/WorkoutHeader"
import { decodePayload, toSavedWorkout } from "@/services/WorkoutImport"
import { WorkoutStorage, type SavedWorkout } from "@/services/WorkoutStorage"
import { useAppTheme } from "@/theme/context"
import { radius, spacing } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"
import { getActivityEmoji, getAlertDisplay, getGoalDisplay } from "@/utils/workoutUtils"

type State =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "preview"; workout: SavedWorkout }
  | { kind: "saving" }

export default function WorkoutImportRoute() {
  const { d } = useLocalSearchParams<{ d?: string }>()
  const [state, setState] = useState<State>({ kind: "loading" })
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const { themed, theme } = useAppTheme()

  useEffect(() => {
    if (!d) {
      setState({ kind: "error" })
      return
    }
    try {
      const payload = decodePayload(d)
      const workout = toSavedWorkout(payload)
      setState({ kind: "preview", workout })
    } catch {
      setState({ kind: "error" })
    }
  }, [d])

  async function handleSave(scheduledDate?: Date) {
    if (state.kind !== "preview") return
    setState({ kind: "saving" })
    try {
      const workout: SavedWorkout = scheduledDate
        ? { ...state.workout, scheduledDate, status: "scheduled" }
        : state.workout
      await WorkoutStorage.saveWorkout(workout)
      router.replace(`/(tabs)/saved/${workout.id}`)
    } catch {
      setState({ kind: "error" })
    }
  }

  if (state.kind === "loading" || state.kind === "saving") {
    return (
      <SafeAreaView style={themed($centered)}>
        <ActivityIndicator size="large" color={theme.colors.tint} />
        <Text text={state.kind === "saving" ? "Saving workout…" : "Loading…"} style={$marginTop} />
      </SafeAreaView>
    )
  }

  if (state.kind === "error") {
    return (
      <SafeAreaView style={themed($centered)}>
        <Text preset="heading" text="Invalid workout link" />
        <Text
          text="The link you opened is invalid or has expired."
          style={[$marginTop, $textCenter]}
        />
        <Button text="Go back" onPress={() => router.back()} style={$marginTopLg} />
      </SafeAreaView>
    )
  }

  const { workout } = state
  const { workoutPlan } = workout
  const emoji = getActivityEmoji(workout.activity)
  const locationLabel = workout.location === "indoor" ? "Indoor" : "Outdoor"
  const activityLabel = workout.activity.charAt(0).toUpperCase() + workout.activity.slice(1)

  return (
    <SafeAreaView style={themed($screen)}>
      <WorkoutHeader
        title={workout.name}
        workoutType={workoutPlan.type}
        onClose={() => router.back()}
      />

      <ScrollView contentContainerStyle={$scrollContent} showsVerticalScrollIndicator={false}>
        {/* Activity row */}
        <Text style={themed($meta)}>
          {emoji}
          {"  "}
          {activityLabel}
          {"  ·  "}
          {locationLabel}
        </Text>

        <View style={themed($divider)} />

        <PlanPreview plan={workoutPlan} />
      </ScrollView>

      <View style={themed($footer)}>
        <Button preset="primary" text="Save Workout" onPress={() => handleSave()} />
        <Button
          preset="default"
          text="Save & Schedule"
          onPress={() => setDatePickerVisible(true)}
          style={$marginTopSm}
        />
        <Button preset="ghost" text="Cancel" onPress={() => router.back()} style={$marginTopSm} />
      </View>

      <DatePickerModal
        visible={datePickerVisible}
        value={new Date()}
        minimumDate={new Date()}
        onCancel={() => setDatePickerVisible(false)}
        onConfirm={(date) => {
          setDatePickerVisible(false)
          handleSave(date)
        }}
      />
    </SafeAreaView>
  )
}

// ─── Plan preview components ────────────────────────────────────────────────

function PlanPreview({ plan }: { plan: WorkoutPlan }) {
  if (plan.type === "goal") return <GoalPreview plan={plan} />
  if (plan.type === "pacer") return <PacerPreview plan={plan} />
  return <CustomPreview plan={plan} />
}

function GoalPreview({ plan }: { plan: Extract<WorkoutPlan, { type: "goal" }> }) {
  const { themed } = useAppTheme()
  const { goal } = plan.workout
  const goalTypeLabel = (() => {
    switch (goal.type) {
      case "time":
        return "Time goal"
      case "distance":
        return "Distance goal"
      case "energy":
        return "Energy goal"
      default:
        return "Open goal"
    }
  })()

  return (
    <View style={$section}>
      <Text style={themed($label)}>{goalTypeLabel.toUpperCase()}</Text>
      <Text preset="heading" size="xxl" style={themed($bigValue)}>
        {getGoalDisplay(goal)}
      </Text>
    </View>
  )
}

function PacerPreview({ plan }: { plan: Extract<WorkoutPlan, { type: "pacer" }> }) {
  const { themed } = useAppTheme()
  const { distance, time } = plan.workout
  const pacePerUnit = distance.value > 0 ? (time.value / distance.value).toFixed(1) : "—"

  return (
    <View style={$section}>
      <View style={$statRow}>
        <StatBlock label="Distance" value={`${distance.value}`} unit={distance.unit} />
        <View style={themed($statDivider)} />
        <StatBlock label="Time" value={`${time.value}`} unit={time.unit} />
        <View style={themed($statDivider)} />
        <StatBlock label="Pace" value={pacePerUnit} unit={`${distance.unit}/${time.unit}`} />
      </View>
    </View>
  )
}

function StatBlock({ label, value, unit }: { label: string; value: string; unit: string }) {
  const { themed } = useAppTheme()
  return (
    <View style={$statBlock}>
      <Text style={themed($label)}>{label.toUpperCase()}</Text>
      <Text preset="bold" size="xl">
        {value}
      </Text>
      <Text style={themed($unit)}>{unit}</Text>
    </View>
  )
}

function CustomPreview({ plan }: { plan: Extract<WorkoutPlan, { type: "custom" }> }) {
  const { themed } = useAppTheme()
  const { warmup, blocks, cooldown } = plan.workout

  return (
    <View style={$section}>
      {warmup && (
        <SegmentRow
          dot="○"
          label="Warmup"
          detail={getGoalDisplay(warmup.goal)}
          alert={warmup.alert ? getAlertDisplay(warmup.alert) : undefined}
          isLast={!blocks.length && !cooldown}
        />
      )}

      {blocks.map((block, i) => {
        const blockObj = block as Record<string, unknown>
        const iterations = blockObj.iterations as number
        const steps = blockObj.steps as Array<Record<string, unknown>>

        return (
          <View key={i}>
            <BlockSeparator />
            {/* Block header — same timeline layout as rows */}
            <View style={$timelineRow}>
              <View style={$timelineLeft}>
                <View style={themed($blockDot)} />
                <View style={themed($timelineLine)} />
              </View>
              <View style={[$timelineContent, $blockLabelRow]}>
                <Text preset="bold" size="sm">
                  Block {i + 1}
                </Text>
                <View style={themed($iterBadge)}>
                  <Text style={themed($iterText)} size="xxs">
                    {iterations}×
                  </Text>
                </View>
              </View>
            </View>

            {steps.map((step, j) => {
              const inner = step.step as Record<string, unknown> | undefined
              const goal = inner?.goal ?? step.goal
              const alert = inner?.alert
              const purpose = (step.purpose as string) ?? ""
              // always cut the line after the last step — separator provides the break
              const isLastStep = j === steps.length - 1

              return (
                <StepRow
                  key={j}
                  purpose={purpose}
                  duration={getGoalDisplay(goal)}
                  alert={alert ? getAlertDisplay(alert) : undefined}
                  isLast={isLastStep}
                />
              )
            })}
          </View>
        )
      })}

      {cooldown && (
        <>
          <BlockSeparator />
          <SegmentRow
            dot="○"
            label="Cooldown"
            detail={getGoalDisplay(cooldown.goal)}
            alert={cooldown.alert ? getAlertDisplay(cooldown.alert) : undefined}
            isLast
          />
        </>
      )}
    </View>
  )
}

function BlockSeparator() {
  const { themed } = useAppTheme()
  return <View style={themed($blockSeparator)} />
}

function SegmentRow({
  dot,
  label,
  detail,
  alert,
  isLast,
}: {
  dot: string
  label: string
  detail: string
  alert?: string
  isLast?: boolean
}) {
  const { themed } = useAppTheme()
  return (
    <View style={$timelineRow}>
      <View style={$timelineLeft}>
        <Text style={themed($timelineDot)}>{dot}</Text>
        {!isLast && <View style={themed($timelineLine)} />}
      </View>
      <View style={$timelineContent}>
        <View style={$rowInline}>
          <Text preset="bold" size="sm">
            {label}
          </Text>
          <Text style={themed($detailText)} size="sm">
            {detail}
          </Text>
        </View>
        {alert && (
          <Text style={themed($alertText)} size="xxs">
            {alert}
          </Text>
        )}
      </View>
    </View>
  )
}

function StepRow({
  purpose,
  duration,
  alert,
  isLast,
}: {
  purpose: string
  duration: string
  alert?: string
  isLast?: boolean
}) {
  const { themed } = useAppTheme()
  const isWork = purpose === "work"

  return (
    <View style={$timelineRow}>
      <View style={$timelineLeft}>
        <View style={[themed($stepDot), isWork ? themed($workDot) : themed($recoveryDot)]} />
        {!isLast && <View style={themed($timelineLine)} />}
      </View>
      <View style={$timelineContent}>
        <View style={$rowInline}>
          <Text
            style={[themed($purposeText), isWork ? themed($workText) : themed($recoveryText)]}
            size="xs"
          >
            {purpose.charAt(0).toUpperCase() + purpose.slice(1)}
          </Text>
          <Text style={themed($detailText)} size="sm">
            {duration}
          </Text>
        </View>
        {alert && (
          <Text style={themed($alertText)} size="xxs">
            {alert}
          </Text>
        )}
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const $screen: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $centered: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.lg,
  backgroundColor: colors.background,
})

const $scrollContent: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxl,
}

const $footer: ThemedStyle<ViewStyle> = ({ colors, spacing: s }) => ({
  padding: s.lg,
  borderTopWidth: 1,
  borderTopColor: colors.border,
})

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.separator,
  marginVertical: spacing.lg,
})

const $meta: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 15,
})

const $section: ViewStyle = {
  paddingBottom: spacing.md,
}

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 11,
  letterSpacing: 1,
  marginBottom: spacing.xs,
})

const $bigValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $unit: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
  marginTop: 2,
})

// Pacer stat row
const $statRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "stretch",
}

const $statBlock: ViewStyle = {
  flex: 1,
  alignItems: "center",
  paddingVertical: spacing.sm,
}

const $statDivider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 1,
  backgroundColor: colors.separator,
  marginVertical: spacing.xs,
})

const $blockLabelRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}

const $blockDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: colors.tint,
})

const $iterBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderRadius: radius.xs,
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
  marginLeft: spacing.xs,
})

const $iterText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontWeight: "700",
})

// Timeline
const $timelineRow: ViewStyle = {
  flexDirection: "row",
  minHeight: 36,
}

const $timelineLeft: ViewStyle = {
  width: 24,
  alignItems: "center",
}

const $timelineDot: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  lineHeight: 24,
})

const $timelineLine: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  width: 1,
  backgroundColor: colors.separator,
  marginVertical: 2,
})

const $timelineContent: ViewStyle = {
  flex: 1,
  paddingLeft: spacing.sm,
  paddingBottom: spacing.sm,
  justifyContent: "center",
}

const $rowInline: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $detailText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $alertText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  marginTop: 2,
  fontStyle: "italic",
})

const $stepDot: ThemedStyle<ViewStyle> = () => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  marginTop: 8,
})

const $workDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
})

const $recoveryDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.separator,
})

const $purposeText: ThemedStyle<TextStyle> = () => ({
  fontWeight: "600",
})

const $workText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
})

const $recoveryText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $blockSeparator: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.separator,
  marginVertical: spacing.md,
  marginLeft: 24,
})

const $marginTop: TextStyle = { marginTop: spacing.sm }
const $marginTopSm: ViewStyle = { marginTop: spacing.sm }
const $marginTopLg: ViewStyle = { marginTop: spacing.lg }
const $textCenter: TextStyle = { textAlign: "center" }
