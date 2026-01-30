import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import mobileAds, {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

interface AdContextType {
  showInterstitial: () => Promise<void>;
  showRewarded: (onRewarded: () => void) => Promise<boolean>;
  isInterstitialReady: boolean;
  isRewardedReady: boolean;
  isMobile: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Production Ad Unit IDs
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-9873123247401502/6903669590';

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-9873123247401502/1662937894';

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isInterstitialReady, setIsInterstitialReady] = useState(false);
  const [isRewardedReady, setIsRewardedReady] = useState(false);
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const rewardedRef = useRef<RewardedAd | null>(null);
  const isInitialized = useRef(false);

  // Initialize Mobile Ads SDK
  useEffect(() => {
    const initializeAds = async () => {
      if (!isMobile || isInitialized.current) return;
      
      try {
        await mobileAds().initialize();
        console.log('[AdMob] SDK initialized successfully');
        isInitialized.current = true;
        loadInterstitialAd();
        loadRewardedAd();
      } catch (error) {
        console.error('[AdMob] SDK initialization error:', error);
      }
    };

    initializeAds();
  }, []);

  // Load Interstitial Ad
  const loadInterstitialAd = useCallback(() => {
    if (!isMobile) return;

    try {
      const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: false,
      });

      const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        console.log('[AdMob] Interstitial loaded');
        setIsInterstitialReady(true);
      });

      const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('[AdMob] Interstitial closed');
        setIsInterstitialReady(false);
        interstitialRef.current = null;
        // Load next ad after a short delay
        setTimeout(() => loadInterstitialAd(), 1000);
      });

      const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error('[AdMob] Interstitial error:', error);
        setIsInterstitialReady(false);
        // Retry after delay
        setTimeout(() => loadInterstitialAd(), 5000);
      });

      interstitialRef.current = ad;
      ad.load();
    } catch (error) {
      console.error('[AdMob] Interstitial creation error:', error);
    }
  }, []);

  // Load Rewarded Ad
  const loadRewardedAd = useCallback(() => {
    if (!isMobile) return;

    try {
      const ad = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: false,
      });

      const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('[AdMob] Rewarded ad loaded');
        setIsRewardedReady(true);
      });

      const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('[AdMob] Rewarded ad closed');
        setIsRewardedReady(false);
        rewardedRef.current = null;
        // Load next ad after a short delay
        setTimeout(() => loadRewardedAd(), 1000);
      });

      const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error('[AdMob] Rewarded ad error:', error);
        setIsRewardedReady(false);
        // Retry after delay
        setTimeout(() => loadRewardedAd(), 5000);
      });

      rewardedRef.current = ad;
      ad.load();
    } catch (error) {
      console.error('[AdMob] Rewarded creation error:', error);
    }
  }, []);

  // Show Interstitial Ad
  const showInterstitial = useCallback(async () => {
    if (!isMobile) {
      console.log('[AdMob] Interstitial: Not available on web');
      return;
    }

    if (interstitialRef.current && isInterstitialReady) {
      try {
        setIsInterstitialReady(false);
        await interstitialRef.current.show();
        console.log('[AdMob] Interstitial shown');
      } catch (error) {
        console.error('[AdMob] Interstitial show error:', error);
        loadInterstitialAd();
      }
    } else {
      console.log('[AdMob] Interstitial not ready, loading...');
      loadInterstitialAd();
    }
  }, [isInterstitialReady, loadInterstitialAd]);

  // Show Rewarded Ad
  const showRewarded = useCallback(async (onRewarded: () => void): Promise<boolean> => {
    if (!isMobile) {
      console.log('[AdMob] Rewarded: Not available on web');
      onRewarded();
      return true;
    }

    if (rewardedRef.current && isRewardedReady) {
      return new Promise((resolve) => {
        let rewarded = false;

        const unsubscribeEarned = rewardedRef.current!.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward) => {
            console.log('[AdMob] Reward earned:', reward);
            rewarded = true;
            onRewarded();
          }
        );

        const unsubscribeClosed = rewardedRef.current!.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            unsubscribeEarned();
            unsubscribeClosed();
            resolve(rewarded);
          }
        );

        setIsRewardedReady(false);
        rewardedRef.current!.show().catch((error) => {
          console.error('[AdMob] Rewarded show error:', error);
          unsubscribeEarned();
          unsubscribeClosed();
          loadRewardedAd();
          resolve(false);
        });
      });
    } else {
      console.log('[AdMob] Rewarded ad not ready, loading...');
      loadRewardedAd();
      return false;
    }
  }, [isRewardedReady, loadRewardedAd]);

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
