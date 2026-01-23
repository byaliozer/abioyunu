import React, { createContext, useContext, useCallback, useState } from 'react';
import { Platform } from 'react-native';

interface AdContextType {
  showInterstitial: () => Promise<void>;
  showRewarded: (onRewarded: () => void) => Promise<boolean>;
  isInterstitialReady: boolean;
  isRewardedReady: boolean;
  isMobile: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Web/development version - no real ads
export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isInterstitialReady] = useState(false);
  const [isRewardedReady] = useState(true); // Always ready for testing

  const showInterstitial = useCallback(async () => {
    console.log('[AdMob] Interstitial: Web/dev mode - skipped');
  }, []);

  const showRewarded = useCallback(async (onRewarded: () => void): Promise<boolean> => {
    console.log('[AdMob] Rewarded: Web/dev mode - granting reward for testing');
    // In development, auto-grant reward for testing
    onRewarded();
    return true;
  }, []);

  return (
    <AdContext.Provider value={{
      showInterstitial,
      showRewarded,
      isInterstitialReady,
      isRewardedReady,
      isMobile,
    }}>
      {children}
    </AdContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
}
