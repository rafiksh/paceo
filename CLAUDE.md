# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What is Paceo

A fitness app built with React Native and Expo. Users build structured workouts and export them to Apple WorkoutKit for use on iPhone/Apple Watch.

## Dev Commands

```bash
npm install          # install deps
npm run adb          # Android reverse ports (local dev)

npm start            # Expo dev server
npm run ios          # iOS simulator
npm run android      # Android emulator

npm run compile      # TypeScript check
npm run lint         # ESLint with auto-fix
npm run lint:check   # ESLint without auto-fix
npm test             # Jest
npm test:watch       # Jest watch

# iOS builds
npm run build:ios:sim / :device / :preview / :prod

# Android builds
npm run build:android:sim / :device / :preview / :prod

npm run test:maestro     # E2E tests
npm run depcruise        # dependency violations
npm run depcruise:graph  # dependency graph
```

## Architecture

### Routing

File-based routing via Expo Router, two main tabs:

- **Home** (`home/`) — home screen
- **Saved** (`saved/`) — saved workout list → detail preview

### Key Services

**WorkoutStorage** (`src/services/WorkoutStorage.ts`) — AsyncStorage CRUD for workouts. Stores activity type, location, creation date.

### Theme System

Context-based theming at `src/theme/`. Use `useAppTheme()` to get `themed()` and `theme`. Supports dark mode. Design tokens cover colors, spacing, and typography.

### Components

- UI components → `src/components/`
- Screen-level → `src/screens/`
- Forms → `src/components/WorkoutForm/` (React Hook Form + Zod)

### Workout Types

Three types, each with its own form:
- **Goal** — time / distance / energy / open goal
- **Pacer** — distance + time target
- **Custom** — interval blocks with warmup/cooldown

### Data Flow

1. Pick activity + location
2. Configure workout via type-specific form
3. Zod validation → WorkoutPlan
4. Save to AsyncStorage via WorkoutStorage

### Path Aliases

- `@/*` → `src/*`
- `@assets/*` → `assets/*`

### i18n

i18next with translations in `src/i18n/` (en, ar, es, fr, hi, ja, ko). Use `translate()` for strings, date-fns for locale-aware dates.

### Reactotron

Dev-only debugger (`src/devtools/ReactotronConfig.ts`). Never use in production — ESLint enforces this via `reactotron/no-tron-in-production`.

### Native Modules

**expo-workoutkit** (`github:rafiksh/expo-workoutkit`) — WorkoutKit integration for iOS. Provides types for `HKWorkoutActivityType`, `WorkoutPlan`, etc.

### ESLint Rules

- Named imports only from `react` (no default import)
- `SafeAreaView` from `react-native-safe-area-context`, not `react-native`
- Use `@/components` wrappers instead of bare RN `Text`, `Button`, `TextInput`
- Import order: react → react-native → expo → internal (`@/*`) → others, alphabetized within groups

### TypeScript

Strict mode. No implicit any. Path aliases in tsconfig. Custom type roots in `./types/`.
