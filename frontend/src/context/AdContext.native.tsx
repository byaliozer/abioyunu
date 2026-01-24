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

// TEMPORARY: AdMob disabled for build diagnostic
// TODO: Re-enable when build issue is resolved
export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isInterstitialReady] = useState(false);
  const [isRewardedReady] = useState(false);

  const showInterstitial = useCallback(async () => {
    console.log('[AdMob] Interstitial: Temporarily disabled');
  }, []);

  const showRewarded = useCallback(async (onRewarded: () => void): Promise<boolean> => {
    console.log('[AdMob] Rewarded: Temporarily disabled');
    // Grant reward for testing purposes
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
