# Project Structure

```
src/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication related screens
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout
│
├── components/            # Reusable components
│   ├── common/           # Shared components
│   ├── forms/            # Form-related components
│   └── layouts/          # Layout components
│
├── constants/            # App constants
│   ├── colors.ts
│   ├── theme.ts
│   └── config.ts
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   └── useTheme.ts
│
├── lib/                # Third-party library configurations
│   ├── api.ts         # API client setup
│   └── storage.ts     # Storage utilities
│
├── services/          # Business logic and API calls
│   ├── auth/
│   ├── user/
│   └── api/
│
├── store/            # State management (Zustand)
│   ├── auth/
│   └── user/
│
├── types/            # TypeScript type definitions
│   ├── api.ts
│   └── models.ts
│
├── utils/            # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
│
└── assets/          # Static assets
    ├── images/
    ├── fonts/
    └── icons/
```

## Directory Structure Explanation

### `/app`
- Contains all the screens and navigation logic using Expo Router
- Organized by feature/flow (auth, tabs, etc.)

### `/components`
- Reusable UI components
- Organized by type and feature
- Each component should have its own directory with:
  - Component file
  - Styles (if not using NativeWind)
  - Tests
  - Types

### `/constants`
- App-wide constants
- Theme configuration
- Environment variables

### `/hooks`
- Custom React hooks
- Shared logic between components

### `/lib`
- Third-party library configurations
- API client setup
- Storage utilities

### `/services`
- Business logic
- API integration
- Data fetching and manipulation

### `/store`
- State management using Zustand
- Organized by feature/domain

### `/types`
- TypeScript type definitions
- Shared interfaces and types

### `/utils`
- Helper functions
- Formatters
- Validators

### `/assets`
- Static assets like images, fonts, and icons
- Organized by type 