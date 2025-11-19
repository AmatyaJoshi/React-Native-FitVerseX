# FitVerseX - React Native Fitness Application

A comprehensive React Native fitness tracking application built with Expo, designed to help users manage workouts, track exercises, and monitor their fitness progress with an intuitive and user-friendly interface.

## Screenshots

[Add screenshots of the application here]

## Table of Contents

- [Application Description](#application-description)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone Repository](#clone-repository)
  - [Environment Setup](#environment-setup)
  - [Install Dependencies](#install-dependencies)
  - [Start Development Server](#start-development-server)
- [Building and Deployment](#building-and-deployment)
- [Contributing](#contributing)
- [License](#license)

## Application Description

FitVerseX is a feature-rich fitness tracking application that enables users to create personalized workout routines, log exercises with sets and reps, track progress over time, and manage their fitness goals. The application supports multiple weight units (kilograms and pounds) and height measurements, providing a flexible experience for users worldwide.

The application leverages Clerk for authentication, Sanity CMS for content management, and React Native with Expo for cross-platform development, delivering a seamless experience on both iOS and Android platforms.

## Key Features

### Authentication and User Management
- Secure user authentication via Clerk with support for email/password and social login (Apple, Google)
- Email verification during sign-up process
- User profile management with account settings

### Workout Management
- Create and manage customized workout routines
- Add multiple exercises per workout with specific exercise selection from a comprehensive database
- Real-time workout timer with pause/resume functionality
- Take breaks during workouts with countdown timer
- Track sets, reps, and weights with unit conversion support

### Exercise Tracking
- Browse comprehensive exercise database
- Log exercise details including sets, reps, and weight
- Support for multiple weight units with automatic conversion (lbs to kg and vice versa)
- Exercise search and filtering capabilities

### Progress Monitoring
- View complete workout history with detailed statistics
- Track key metrics: total workouts, total time, average duration, days since joining
- Analyze workout records with exercise breakdown
- Visual progress indicators

### User Measurements
- Record and manage user height and weight
- Support for multiple units: centimeters/feet-inches for height, kilograms/pounds for weight
- Quick-access measurements modal for easy updates

### Theme and Personalization
- Dark and light theme support
- Persistent theme preference
- Responsive design across different screen sizes

### Additional Features
- Pull-to-refresh functionality
- Offline-first data management with local state management
- Seamless keyboard handling for data input
- Professional UI with consistent design system

## Technology Stack

### Frontend Framework
- React Native 0.81.5
- Expo 54.0.25
- Expo Router 6.0.15 (Navigation)

### State Management
- Zustand 5.0.8 (Lightweight store for workout data)

### Authentication
- Clerk Expo 2.18.3

### Backend and CMS
- Sanity CMS 7.12.1
- Sanity Client 7.12.1

### UI and Styling
- NativeWind 4.0.1 (Tailwind CSS for React Native)
- Tailwind CSS 3.4.0
- Expo Vector Icons 15.0.3

### Data and Storage
- Async Storage 2.2.0
- GROQ (Sanity Query Language)

### Media
- Expo Video 3.0.14 (Video playback)

### AI Integration
- OpenAI 6.8.1
- Expo Auth Session 7.0.9
- Expo Linking 8.0.9

### Development Tools
- TypeScript 5.9.2
- Babel 7.20.0

## Project Structure

```
react-native-fitness-app/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── _layout.tsx                 # Protected routes layout with auth guard
│   │   │   ├── sign-in.tsx                 # User login screen
│   │   │   ├── sign-up.tsx                 # User registration screen
│   │   │   ├── exercise-detail.tsx         # Exercise details view
│   │   │   ├── exercise-selection.tsx      # Exercise selection modal
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx             # Tab navigation layout
│   │   │   │   ├── index.tsx               # Home/Dashboard screen
│   │   │   │   ├── exercises.tsx           # Browse exercises screen
│   │   │   │   ├── workout.tsx             # Start workout screen
│   │   │   │   ├── active-workout.tsx      # Active workout tracking
│   │   │   │   ├── history/
│   │   │   │   │   ├── _layout.tsx
│   │   │   │   │   ├── index.tsx           # Workout history list
│   │   │   │   │   └── workout-record.tsx  # Detailed workout record
│   │   │   │   └── profile/
│   │   │   │       ├── _layout.tsx
│   │   │   │       ├── index.tsx           # User profile page
│   │   │   │       ├── edit-profile.tsx    # Edit profile information
│   │   │   │       ├── notifications.tsx   # Notification settings
│   │   │   │       ├── preferences.tsx     # App preferences
│   │   │   │       └── help-support.tsx    # Help and support
│   │   │   └── profile/
│   │   │       ├── _layout.tsx
│   │   │       ├── edit-profile.tsx
│   │   │       ├── help-support.tsx
│   │   │       ├── notifications.tsx
│   │   │       └── preferences.tsx
│   │   ├── _layout.tsx                     # Root layout with providers
│   │   └── api/
│   │       ├── ai+api.ts                   # AI guidance API route
│   │       ├── save-workout+api.ts         # Workout save API route
│   │       └── delete-workout+api.ts       # Workout delete API route
│   ├── components/
│   │   ├── ExerciseCard.tsx                # Reusable exercise card
│   │   ├── ExerciseSelectionModal.tsx      # Modal for exercise selection
│   │   ├── AppleSignIn.tsx                 # Apple authentication component
│   │   └── GoogleSignIn.tsx                # Google authentication component
│   ├── lib/
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx            # Theme management context
│   │   ├── hooks/
│   │   │   └── useAIGuidance.ts            # AI guidance custom hook
│   │   ├── sanity/
│   │   │   ├── client.ts                   # Sanity CMS client configuration
│   │   │   └── types.ts                    # TypeScript types for Sanity
│   │   └── utils.ts                        # Utility functions
│   └── global.css                          # Global styles
├── store/
│   └── workout-store.ts                    # Zustand workout state store
├── sanity/
│   ├── schemaTypes/
│   │   ├── index.ts                        # Schema index
│   │   ├── exercise.ts                     # Exercise schema definition
│   │   └── workout.ts                      # Workout schema definition
│   ├── sanity.config.ts                    # Sanity CMS configuration
│   ├── sanity.cli.ts                       # Sanity CLI configuration
│   └── static/                             # Static assets
├── assets/
│   ├── fonts/                              # Custom fonts
│   └── videos/                             # Video assets
├── images/                                 # Image assets
├── app.json                                # Expo app configuration
├── expo.json                               # Expo configuration
├── tailwind.config.js                      # Tailwind CSS configuration
├── tsconfig.json                           # TypeScript configuration
├── metro.config.js                         # Metro bundler configuration
├── babel.config.js                         # Babel configuration
├── package.json                            # Project dependencies
└── README.md                               # This file
```

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (version 18.x or higher)
- npm (version 9.x or higher) or yarn
- Expo CLI (install globally with `npm install -g expo-cli`)
- Git
- Xcode (for iOS development on macOS)
- Android Studio (for Android development)

### Clone Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/AmatyaJoshi/React-Native-FitVerseX.git
cd react-native-fitness-app
```

### Environment Setup

Create a `.env.local` file in the root directory with the following environment variables:

```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Sanity CMS
EXPO_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
EXPO_PUBLIC_SANITY_DATASET=your_sanity_dataset

# OpenAI API (optional, for AI features)
OPENAI_API_KEY=your_openai_api_key
```

To obtain these credentials:

1. **Clerk**: Visit https://dashboard.clerk.com and create a new application
2. **Sanity**: Visit https://sanity.io and create a new project
3. **OpenAI**: Visit https://platform.openai.com and create an API key

### Install Dependencies

Install all required project dependencies:

```bash
npm install
```

Or if using yarn:

```bash
yarn install
```

### Start Development Server

Start the Expo development server:

```bash
npm run start
```

This will display a QR code in your terminal. You can:

- **Run on iOS**: Press `i` in the terminal (requires Xcode on macOS)
- **Run on Android**: Press `a` in the terminal (requires Android Studio/Android SDK)
- **Run on Web**: Press `w` in the terminal
- **Scan QR Code**: Use the Expo Go app (available on iOS and Android app stores)

### Available Scripts

```bash
# Start development server
npm run start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Deploy to production
npm run deploy
```

## Building and Deployment

### Build for iOS

```bash
eas build --platform ios
```

### Build for Android

```bash
eas build --platform android
```

### Deploy with EAS

```bash
npm run deploy
```

For detailed deployment instructions, refer to the Expo documentation: https://docs.expo.dev/build/introduction/

## Contributing

Contributions are welcome and greatly appreciated. To contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure that your code follows the existing code style and includes appropriate comments for complex logic.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

For more information and support, please visit the project repository or contact the development team.