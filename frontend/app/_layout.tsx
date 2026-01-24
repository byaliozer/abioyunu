import React, { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SoundProvider } from '../src/context/SoundContext';
import { AdProvider } from '../src/context/AdContext';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { hasUsername } from '../src/services/api';
import { ErrorBoundary } from 'react-error-boundary';

// Error fallback component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Bir hata oluştu</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
    </View>
  );
}

function RootLayoutNav() {
  const [isLoading, setIsLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  const checkUsername = useCallback(async () => {
    try {
      const has = await hasUsername();
      setNeedsUsername(!has);
      setIsLoading(false);
    } catch (e) {
      console.error('Error checking username:', e);
      setIsLoading(false);
    }
  }, []);

  // Check on mount
  useEffect(() => {
    checkUsername();
  }, []);

  // Re-check only when navigating back to home from username screen
  useEffect(() => {
    if (!isLoading && pathname === '/' && needsUsername) {
      checkUsername();
    }
  }, [pathname]);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    const inUsernameScreen = segments[0] === 'username';

    if (needsUsername && !inUsernameScreen) {
      // Need username but not on username screen -> redirect
      router.replace('/username');
    } else if (!needsUsername && inUsernameScreen) {
      // Have username but on username screen -> go to home
      router.replace('/');
    }
  }, [isLoading, needsUsername, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#009688" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#1a1a2e' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="username" options={{ gestureEnabled: false }} />
      <Stack.Screen name="episodes" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="result" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SoundProvider>
      <AdProvider>
        <StatusBar style="light" />
        <RootLayoutNav />
      </AdProvider>
    </SoundProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});
