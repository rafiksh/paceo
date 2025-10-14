# 🏃‍♂️ Paceo - AI-Powered Fitness App

A modern React Native fitness app built with Expo, featuring AI-powered workout generation and comprehensive workout management.

![Paceo App](https://img.shields.io/badge/React%20Native-Expo-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![AI Powered](https://img.shields.io/badge/AI-OpenAI-green)

## ✨ Features

### 🤖 AI-Powered Workout Generation

- **Smart Workout Creation** - Ask the AI to create custom workouts
- **Natural Language Processing** - Describe your fitness goals in plain English
- **Automatic Workout Parsing** - AI responses are automatically converted to structured workout plans
- **Secure API Key Storage** - Your OpenAI API key is stored securely using device encryption

### 🏋️‍♀️ Comprehensive Workout Builder

- **Multiple Workout Types**:
  - **Goal Workouts** - Time, distance, or energy-based goals
  - **Pacer Workouts** - Distance and time combinations
  - **Custom Workouts** - Complex interval blocks with warmup/cooldown
- **Dynamic Forms** - Forms adapt based on selected workout types
- **Alert System** - Configure heart rate, speed, power, cadence, and pace alerts
- **Real-time Preview** - Preview workouts before saving

### 💾 Local Storage & Management

- **Persistent Storage** - Workouts saved locally using AsyncStorage
- **Workout History** - View and manage all your saved workouts
- **Easy Deletion** - Remove workouts you no longer need
- **Workout Details** - Rich information display for each saved workout

### 🎨 Modern UI/UX

- **Clean Design** - Black and white theme with modern typography
- **Responsive Layout** - Works perfectly on all screen sizes
- **Tab Navigation** - Intuitive bottom tab navigation
- **Consistent Design System** - Standardized colors, typography, and spacing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/paceo.git
   cd paceo
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server**

   ```bash
   npm start
   # or
   pnpm start
   ```

4. **Run on device/simulator**

   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   ```

## 🔧 Configuration

### OpenAI API Key Setup

1. **Get your API key** from [OpenAI Platform](https://platform.openai.com/)
2. **Open the app** and navigate to the "AI" tab
3. **Enter your API key** in the secure input field
4. **Start chatting** with the AI to generate workouts

> **Security Note**: Your API key is stored securely using device encryption and never leaves your device.

## 📱 App Structure

### Navigation

- **Builder Tab** - Create and configure workouts
- **Saved Tab** - View and manage saved workouts  
- **AI Tab** - Chat with AI for workout generation

### Workflow

1. **Activity Selection** - Choose your workout activity (running, cycling, etc.)
2. **Workout Configuration** - Select workout type and configure parameters
3. **AI Generation** - Ask AI to create custom workouts
4. **Save & Preview** - Save workouts locally and preview before starting

## 🛠️ Technical Stack

### Core Technologies

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based routing system

### Key Libraries

- **OpenAI** - AI-powered workout generation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **AsyncStorage** - Local data persistence
- **Expo SecureStore** - Secure API key storage
- **React Native Heroicons** - Beautiful icon library

### Architecture

- **Component-based** - Reusable UI components
- **Theme System** - Centralized design tokens
- **Type Safety** - Full TypeScript coverage
- **Error Handling** - Comprehensive error management

## 🎯 Workout Types Supported

### Goal Workouts

- **Open Goal** - No specific target
- **Time Goal** - Duration-based (seconds, minutes, hours)
- **Distance Goal** - Distance-based (meters, kilometers, miles)
- **Energy Goal** - Calorie-based targets

### Pacer Workouts

- **Distance + Time** - Complete a distance in a specific time
- **Pace Training** - Maintain consistent pace

### Custom Workouts

- **Interval Blocks** - Complex interval training
- **Warmup/Cooldown** - Structured workout phases
- **Multiple Steps** - Detailed workout progression
- **Alert Configuration** - Performance monitoring

## 🔒 Security & Privacy

- **Local Storage Only** - All data stays on your device
- **Encrypted API Keys** - Secure storage using device encryption
- **No Data Collection** - We don't collect or store your personal data
- **Open Source** - Transparent codebase you can audit

## 🚧 Development

### Project Structure

```
src/
├── app/                 # Expo Router pages
├── components/         # Reusable UI components
├── screens/           # Screen components
├── services/          # Business logic
├── theme/            # Design system
└── utils/            # Utility functions
```

### Key Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator

# Building
npm run build:ios     # Build for iOS
npm run build:android # Build for Android

# Testing
npm test              # Run tests
npm run lint          # Run ESLint
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo** - Amazing development platform
- **OpenAI** - Powerful AI capabilities
- **React Native Community** - Great ecosystem
- **Infinite Red** - Ignite boilerplate

## 📞 Support

- **Issues** - [GitHub Issues](https://github.com/yourusername/paceo/issues)
- **Discussions** - [GitHub Discussions](https://github.com/yourusername/paceo/discussions)
- **Documentation** - [Wiki](https://github.com/yourusername/paceo/wiki)

---

**Built with ❤️ using React Native, Expo, and OpenAI**

*Paceo - Your AI-powered fitness companion*
