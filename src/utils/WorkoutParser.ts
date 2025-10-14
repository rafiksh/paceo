import type {
  WorkoutPlan,
  HKWorkoutActivityType,
  HKWorkoutSessionLocationType,
} from "expo-workoutkit"

export interface ParsedWorkout {
  name: string
  activity: HKWorkoutActivityType
  location: HKWorkoutSessionLocationType
  workoutPlan: WorkoutPlan
}

export class WorkoutParser {
  /**
   * Parse AI response to extract workout information
   */
  static parseWorkoutFromAI(response: string): ParsedWorkout | null {
    try {
      // Look for JSON-like structure in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return null

      const workoutData = JSON.parse(jsonMatch[0])

      // Validate required fields
      if (!workoutData.name || !workoutData.activity || !workoutData.workoutPlan) {
        return null
      }

      return {
        name: workoutData.name,
        activity: workoutData.activity,
        location: workoutData.location || "outdoor",
        workoutPlan: workoutData.workoutPlan,
      }
    } catch {
      return null
    }
  }

  /**
   * Generate workout creation prompt for AI
   */
  static getWorkoutCreationPrompt(userRequest: string): string {
    return `Create a workout based on this request: "${userRequest}"

Please respond with a JSON object in this exact format:
{
  "name": "Workout Name",
  "activity": "running" | "cycling" | "walking" | "swimming" | "strengthTraining" | "yoga" | "pilates" | "dance" | "other",
  "location": "outdoor" | "indoor",
  "workoutPlan": {
    "type": "goal" | "pacer" | "custom",
    "workout": {
      // For goal workout:
      "goal": {
        "type": "open" | "time" | "distance" | "energy",
        "value": number,
        "unit": "seconds" | "minutes" | "hours" | "meters" | "kilometers" | "yards" | "miles" | "feet" | "calories" | "kilocalories" | "joules" | "kilojoules"
      }
      // For pacer workout:
      "distance": {
        "type": "distance",
        "value": number,
        "unit": "meters" | "kilometers" | "yards" | "miles" | "feet"
      },
      "time": {
        "type": "time", 
        "value": number,
        "unit": "seconds" | "minutes" | "hours"
      }
      // For custom workout:
      "displayName": "Custom Workout Name",
      "warmup": {
        "duration": number,
        "unit": "seconds" | "minutes" | "hours"
      },
      "blocks": [
        {
          "iterations": number,
          "steps": [
            {
              "duration": number,
              "unit": "seconds" | "minutes" | "hours",
              "alerts": [
                {
                  "type": "speed" | "heartRate" | "power" | "cadence" | "pace",
                  "metric": "current" | "average" | "maximum",
                  "targetRange": {
                    "min": number,
                    "max": number
                  }
                }
              ]
            }
          ]
        }
      ],
      "cooldown": {
        "duration": number,
        "unit": "seconds" | "minutes" | "hours"
      }
    }
  }
}

Make sure the workout is realistic and appropriate for the requested activity. Use proper units and reasonable durations/distances.`
  }

  /**
   * Check if the AI response contains workout data
   */
  static containsWorkoutData(response: string): boolean {
    return (
      response.includes('"workoutPlan"') &&
      response.includes('"name"') &&
      response.includes('"activity"')
    )
  }

  /**
   * Extract workout name from response if it's not in JSON format
   */
  static extractWorkoutName(response: string): string | null {
    const nameMatch = response.match(/"name":\s*"([^"]+)"/)
    return nameMatch ? nameMatch[1] : null
  }
}
