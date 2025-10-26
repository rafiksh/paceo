# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Paceo is an AI-powered fitness app built with React Native and Expo. It features AI-powered workout generation using OpenAI, comprehensive workout building capabilities, and integration with Apple's WorkoutKit for iOS workout management.

## Development Commands

### Environment Setup

```bash
npm install              # Install dependencies
npm run adb             # Setup Android reverse ports for local development
```

### Running the App

```bash
npm start               # Start Expo dev server with dev client
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator
npm run web             # Run web version
```

### Code Quality

```bash
npm run compile         # TypeScript type checking (no emit)
npm run lint            # Run ESLint with auto-fix
npm run lint:check      # Run ESLint without auto-fix
npm test                # Run Jest tests
npm test:watch          # Run Jest in watch mode
```

### Building

```bash
# iOS builds
npm run build:ios:sim       # Development build for simulator
npm run build:ios:device    # Development build for device
npm run build:ios:preview   # Preview build
npm run build:ios:prod      # Production build

# Android builds
npm run build:android:sim       # Development build for emulator
npm run build:android:device    # Development build for device
npm run build:android:preview   # Preview build
npm run build:android:prod      # Production build
```

### Other Commands

```bash
npm run test:maestro        # Run Maestro E2E tests
npm run depcruise           # Check dependency violations
npm run depcruise:graph     # Generate dependency graph visualization
```

## Architecture

### Routing & Navigation

The app uses **Expo Router** (file-based routing) with a tab-based navigation structure:

- `src/app/_layout.tsx` - Root layout with theme, i18n, and keyboard providers
- `src/app/(tabs)/_layout.tsx` - Tab navigator with three main tabs:
  - **Builder** (`builder/`) - Activity selection and workout configuration
  - **Saved** (`saved/`) - View and manage saved workouts
  - **AI** (`ai/`) - AI assistant for workout generation

Navigation flow:

1. Builder tab: `index.tsx` (activity selection) → `configure.tsx` (workout builder)
2. Saved tab: `index.tsx` (workout list) → `preview.tsx` (workout details)
3. AI tab: `index.tsx` (API key setup) → `chat.tsx` (AI conversation)

### Key Services & Utilities

**WorkoutStorage** (`src/services/WorkoutStorage.ts`)

- Manages workout persistence using AsyncStorage
- CRUD operations for saved workouts
- Tracks workout origin (AI-generated vs manual)
- Stores workouts with activity type, location, and creation date

**WorkoutParser** (`src/utils/WorkoutParser.ts`)

- Parses AI responses to extract structured workout data
- Generates prompts for OpenAI to create workouts in correct format
- Validates workout data structure
- Supports three workout types: goal, pacer, and custom

**AI Integration** (`src/app/(tabs)/ai/chat.tsx`)

- Uses OpenAI API for workout generation and fitness advice
- API keys stored securely using Expo SecureStore
- Supports model selection (stored in SecureStore)
- Parses AI responses to create WorkoutKit-compatible workout plans
- Implements conversation interface with message history

### Theme System

The app uses a comprehensive theme system with:

- Context-based theming (`src/theme/context.tsx`)
- Centralized design tokens for colors, spacing, and typography
- `ThemedStyle` type for creating theme-aware styles
- `useAppTheme()` hook provides `themed()` function and `theme` object
- Dark mode support with separate color palettes

### Component Architecture

**Reusable Components** (`src/components/`)

- All UI components are in `src/components/`
- Screen-level components in `src/screens/`
- Form components in `src/components/WorkoutForm/`
- Components use theme system for consistent styling
- Heavy use of React Hook Form for form management with Zod validation

**Workout Building Flow**

1. `ActivitySelectionScreen` - Choose activity type and location
2. `WorkoutConfigurationScreen` - Build workout using forms based on type
3. Three workout types supported:
   - **Goal workouts**: Simple time/distance/energy/open goals
   - **Pacer workouts**: Combination of distance + time targets
   - **Custom workouts**: Complex interval blocks with warmup/cooldown

### Data Flow

**Workout Creation**

1. User selects activity and location
2. User configures workout using type-specific forms
3. Workout data validated with Zod schemas
4. WorkoutPlan created from form data
5. Saved to AsyncStorage via WorkoutStorage

**AI Workout Generation**

1. User enters workout request in chat
2. WorkoutParser generates structured prompt
3. OpenAI API returns workout JSON
4. Parser extracts and validates workout data
5. User confirms and saves workout

### Path Aliases

The project uses TypeScript path aliases:

- `@/*` maps to `src/*`
- `@assets/*` maps to `assets/*`

### i18n Support

Internationalization using i18next:

- `src/i18n/` contains translations for multiple languages (en, ar, es, fr, hi, ja, ko)
- `translate()` function available for string localization
- Date formatting with locale support via date-fns

### Development Tools

**Reactotron** (development only)

- Configured in `src/devtools/ReactotronConfig.ts`
- Only loaded in development (`if (__DEV__)`)
- MMKV storage plugin for debugging
- IMPORTANT: Never use Reactotron in production code (enforced by ESLint rule `reactotron/no-tron-in-production`)

### Native Modules

**expo-workoutkit**

- Custom native module from `github:rafiksh/expo-workoutkit`
- Provides WorkoutKit integration for iOS
- TypeScript types for HKWorkoutActivityType, WorkoutPlan, etc.

### ESLint Rules

Key import restrictions enforced:

- Never import default from `react` - use named exports
- Use `SafeAreaView` from `react-native-safe-area-context`, not `react-native`
- Use custom wrapper components from `@/components` instead of React Native's `Text`, `Button`, `TextInput`
- Import order: react → react-native → expo → internal (@/*) → others
- Alphabetize imports within groups

### TypeScript Configuration

- Strict mode enabled
- Path aliases configured for `@/*` and `@assets/*`
- Full type coverage required (no implicit any)
- Custom type roots include `./types/`
