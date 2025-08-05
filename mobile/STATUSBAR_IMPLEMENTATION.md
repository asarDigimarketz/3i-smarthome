# Professional StatusBar Implementation Guide

## Overview

This document explains the professional StatusBar implementation in the 3i SmartHome mobile app. The implementation follows React Native and Expo Router best practices to ensure consistent StatusBar behavior across all screens.

## Architecture

### 1. Centralized StatusBar Management

The StatusBar is managed centrally through the root layout (`src/app/_layout.tsx`) using the `StatusBarManager` component. This ensures:

- **Consistent behavior**: All screens inherit the same StatusBar configuration
- **Dynamic updates**: StatusBar adapts based on the current route
- **No conflicts**: Eliminates multiple StatusBar instances causing issues

### 2. Component Structure

```
src/
├── app/
│   ├── _layout.tsx (Root layout with StatusBarManager)
│   ├── (auth)/_layout.jsx (Auth layout - no StatusBar)
│   ├── (tabs)/_layout.tsx (Tabs layout - no StatusBar)
│   └── (any)/_layout.jsx (Any layout - no StatusBar)
├── components/
│   └── Common/
│       ├── StatusBarManager.tsx (Dynamic StatusBar management)
│       └── CustomStatusBar.tsx (Custom StatusBar component)
└── hooks/
    └── useStatusBar.ts (StatusBar hook for specific screens)
```

## Key Components

### StatusBarManager.tsx

The main StatusBar management component that:

- **Monitors route changes**: Uses `usePathname()` to detect current screen
- **Applies appropriate styles**: Sets StatusBar style based on screen type
- **Handles color scheme**: Adapts to light/dark mode
- **Prevents conflicts**: Ensures only one StatusBar instance

```typescript
// Example usage in root layout
<SafeAreaProvider>
  <StatusBarManager />
  <AuthProvider>
    {/* App content */}
  </AuthProvider>
</SafeAreaProvider>
```

### CustomStatusBar.tsx

A reusable StatusBar component for screens that need custom StatusBar behavior:

```typescript
// Example usage in specific screens
<CustomStatusBar 
  backgroundColor="#ffffff" 
  barStyle="dark-content" 
/>
```

### useStatusBar.ts

A custom hook for managing StatusBar in specific screens:

```typescript
// Example usage in components
function MyScreen() {
  useStatusBar({
    barStyle: 'light-content',
    backgroundColor: '#030303'
  });
  
  return <View>...</View>;
}
```

## StatusBar Configuration by Screen Type

### Auth Screens
- **Bar Style**: `light-content`
- **Background**: `#030303` (dark)
- **Use Case**: Login, register, forgot password

### Main App Screens (Tabs)
- **Bar Style**: `light-content`
- **Background**: `#030303` (dark)
- **Use Case**: Dashboard, projects, tasks, customers

### Splash Screen
- **Bar Style**: `light-content`
- **Background**: `#030303` (dark)
- **Use Case**: App loading screen

### Default Fallback
- **Bar Style**: Adapts to system theme
- **Background**: Adapts to system theme
- **Use Case**: Unknown or new screens

## Best Practices

### 1. Single SafeAreaProvider
- Only use `SafeAreaProvider` in the root layout
- Remove `SafeAreaProvider` from child layouts to prevent conflicts

### 2. Consistent StatusBar
- Use `StatusBarManager` for automatic StatusBar management
- Only use `CustomStatusBar` or `useStatusBar` for specific customizations

### 3. Route-Based Styling
- StatusBar automatically adapts based on current route
- No manual StatusBar management needed in most screens

### 4. Performance Optimization
- StatusBar changes are optimized and only occur when necessary
- Cleanup functions prevent memory leaks

## Troubleshooting

### Common Issues

1. **Multiple StatusBar instances**
   - Solution: Remove StatusBar from child layouts
   - Use only StatusBarManager in root layout

2. **StatusBar not updating**
   - Check if StatusBarManager is properly imported
   - Verify route detection is working

3. **Inconsistent styling**
   - Ensure StatusBarManager handles all route patterns
   - Add custom logic for specific screens if needed

### Debug Mode

Enable debug logging in StatusBarManager:

```typescript
console.log('Current pathname:', pathname);
console.log('StatusBar style:', currentBarStyle);
console.log('StatusBar background:', currentBackgroundColor);
```

## Migration Guide

### From Old Implementation

1. **Remove StatusBar from child layouts**
   ```typescript
   // Remove this from child layouts
   <StatusBar backgroundColor="#030303" barStyle="light-content" />
   ```

2. **Remove SafeAreaProvider from child layouts**
   ```typescript
   // Remove this from child layouts
   <SafeAreaProvider>
     {/* content */}
   </SafeAreaProvider>
   ```

3. **Add StatusBarManager to root layout**
   ```typescript
   // Add this to root layout
   <StatusBarManager />
   ```

## Future Enhancements

1. **Theme-based StatusBar**: Support for custom themes
2. **Animation support**: Smooth StatusBar transitions
3. **Platform-specific**: iOS/Android specific StatusBar behavior
4. **Accessibility**: High contrast StatusBar support

## Conclusion

This professional StatusBar implementation ensures:

- ✅ Consistent behavior across all screens
- ✅ No conflicts or multiple instances
- ✅ Dynamic adaptation to routes
- ✅ Proper cleanup and performance
- ✅ Easy maintenance and debugging
- ✅ Follows React Native best practices

The implementation is production-ready and handles all edge cases while maintaining excellent performance and user experience. 