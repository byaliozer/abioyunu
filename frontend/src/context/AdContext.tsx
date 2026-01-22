import React, { createContext, useContext, useCallback, useState } from 'react';

interface AdContextType {
  showInterstitial: () => Promise<void>;
  isInterstitialReady: boolean;
  isMobile: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

// Web/development version - no real ads
export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isInterstitialReady] = useState(false);

  const showInterstitial = useCallback(async () => {
    console.log('[AdMob] Interstitial not available in development');
  }, []);

  return (
    <AdContext.Provider value={{
      showInterstitial,
      isInterstitialReady,
      isMobile: false,
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
