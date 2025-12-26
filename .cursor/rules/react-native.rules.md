
You are an expert in TypeScript, React Native, Expo, and Mobile App Development.

## Code Style and Structure

- Write concise, type-safe TypeScript code.  
- Use functional components and hooks over class components.  
- Ensure components are modular, reusable, and maintainable.  
- Organize files by feature, grouping related components, hooks, and styles.  
- Use functional and declarative programming patterns; avoid classes.  
- Prefer iteration and modularization over code duplication.  
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).  
- Structure files: exported component, subcomponents, helpers, static content, types.  
- Follow Expo's official documentation for setting up and configuring your projects: https://docs.expo.dev/  

## Naming Conventions

- Use camelCase for variable and function names (e.g., `isFetchingData`, `handleUserInput`).  
- Use PascalCase for component names (e.g., `UserProfile`, `ChatScreen`).  
- Directory names should be lowercase and hyphenated (e.g., `user-profile`, `chat-screen`).  
- Favor named exports for components.  

## TypeScript Usage

- Use TypeScript for all components.  
- Enable strict typing in `tsconfig.json`.  
- Avoid using `any`; strive for precise types.  
- Utilize `React.FC` for defining functional components with props.  
- Prefer interfaces over types.  
- Avoid enums; use maps instead.  
- Use strict mode in TypeScript for better type safety.  

## Performance Optimization

- Minimize `useEffect`, `useState`, and heavy computations inside render methods.  
- Use `React.memo()` for components with static props to prevent unnecessary re-renders.  
- Optimize FlatLists with props like `removeClippedSubviews`, `maxToRenderPerBatch`, and `windowSize`.  
- Use `getItemLayout` for FlatLists when items have a consistent size.  
- Avoid anonymous functions in `renderItem` or event handlers.  
- Use context and reducers for global state management.  
- Optimize images: use WebP format where supported, lazy load with `expo-image`.  
- Implement code splitting and lazy loading with React Suspense and dynamic imports.  
- Profile performance using React Native tools and Expo debugging.  

## UI and Styling

- Use consistent styling with `StyleSheet.create()` or styled-components/Tailwind CSS.  
- Ensure responsive design with Flexbox and `useWindowDimensions`.  
- Implement dark mode support with `useColorScheme`.  
- Optimize image handling with `react-native-fast-image` or `expo-image`.  
- Ensure accessibility with ARIA roles and native accessibility props.  
- Use `react-native-reanimated` and `react-native-gesture-handler` for performant animations.  

## Safe Area Management

- Use `SafeAreaProvider` globally.  
- Wrap top-level components with `SafeAreaView`.  
- Use `SafeAreaScrollView` for scrollable content.  
- Avoid hardcoding padding/margins; rely on safe area context.  

## Navigation

- Use `react-navigation` for routing and navigation.  
- Follow best practices for stack, tab, and drawer navigators.  
- Leverage deep linking and universal links.  
- Use dynamic routes with `expo-router`.  

## State Management

- Use React Context and `useReducer` for global state.  
- Use `react-query` for data fetching and caching.  
- For complex state, consider Zustand or Redux Toolkit.  
- Handle URL search parameters with `expo-linking`.  

## Error Handling and Validation

- Use Zod for runtime validation.  
- Implement error logging with Sentry or `expo-error-reporter`.  
- Handle errors early with if-return pattern.  
- Implement global error boundaries.  

## Testing

- Write unit tests with Jest and React Native Testing Library.  
- Implement integration tests with Detox.  
- Use Expo's testing tools for multiple environments.  
- Use snapshot testing for UI consistency.  

## Security

- Sanitize user inputs.  
- Use `react-native-encrypted-storage` for sensitive data.  
- Ensure HTTPS and proper authentication for APIs.  
- Follow Expo's security guidelines: https://docs.expo.dev/guides/security/  

## Internationalization (i18n)

- Use `expo-localization` or `react-native-i18n`.  
- Support multiple languages and RTL layouts.  
- Ensure text scaling and font accessibility.  

## Key Conventions

1. Use Expo's managed workflow.  
2. Prioritize Mobile Web Vitals (Load Time, Jank, Responsiveness).  
3. Use `expo-constants` for environment variables.  
4. Handle permissions with `expo-permissions`.  
5. Implement OTA updates with `expo-updates`.  
6. Follow Expo's deployment best practices: https://docs.expo.dev/distribution/introduction/  
7. Test extensively on both iOS and Android.  
