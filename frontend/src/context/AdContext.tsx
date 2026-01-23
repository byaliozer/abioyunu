import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { ADMOB_IDS, TEST_IDS } from '../config/admob';

interface AdContextType {
  showInterstitial: () => Promise<void>;
  showRewarded: (onRewarded: () => void) => Promise<boolean>;
  isInterstitialReady: boolean;
  isRewardedReady: boolean;
  isMobile: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

// Check if running on mobile
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Try to import mobile ads module
let MobileAds: any = null;
let InterstitialAd: any = null;
let RewardedAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = null;

if (isMobile) {
  try {
    const mobileAdsModule = require('react-native-google-mobile-ads');
    MobileAds = mobileAdsModule.default;
    InterstitialAd = mobileAdsModule.InterstitialAd;
    RewardedAd = mobileAdsModule.RewardedAd;
    AdEventType = mobileAdsModule.AdEventType;
    RewardedAdEventType = mobileAdsModule.RewardedAdEventType;
    TestIds = mobileAdsModule.TestIds;
  } catch (e) {
    console.log('[AdMob] Mobile ads module not available');
  }
}

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isInterstitialReady, setInterstitialReady] = useState(false);
  const [isRewardedReady, setRewardedReady] = useState(false);
  const [interstitialAd, setInterstitialAd] = useState<any>(null);
  const [rewardedAd, setRewardedAd] = useState<any>(null);

  // Initialize ads on mobile
  useEffect(() => {
    if (!isMobile || !MobileAds) return;

    const initAds = async () => {
      try {
        await MobileAds().initialize();
        console.log('[AdMob] Initialized successfully');
        loadInterstitial();
        loadRewarded();
      } catch (e) {
        console.error('[AdMob] Init error:', e);
      }
    };

    initAds();
  }, []);

  const loadInterstitial = () => {
    if (!InterstitialAd) return;

    const adUnitId = __DEV__ ? TEST_IDS.INTERSTITIAL_ID : ADMOB_IDS.INTERSTITIAL_ID;
    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[AdMob] Interstitial loaded');
      setInterstitialReady(true);
      setInterstitialAd(ad);
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdMob] Interstitial closed');
      setInterstitialReady(false);
      setInterstitialAd(null);
      // Preload next ad
      setTimeout(loadInterstitial, 1000);
    });

    ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.error('[AdMob] Interstitial error:', error);
      setInterstitialReady(false);
      // Retry after delay
      setTimeout(loadInterstitial, 5000);
    });

    ad.load();
  };

  const loadRewarded = () => {
    if (!RewardedAd) return;

    const adUnitId = __DEV__ ? TEST_IDS.REWARDED_ID : ADMOB_IDS.REWARDED_ID;
    const ad = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('[AdMob] Rewarded loaded');
      setRewardedReady(true);
      setRewardedAd(ad);
    });

    ad.addAdEventListener(RewardedAdEventType.CLOSED, () => {
      console.log('[AdMob] Rewarded closed');
      setRewardedReady(false);
      setRewardedAd(null);
      // Preload next ad
      setTimeout(loadRewarded, 1000);
    });

    ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.error('[AdMob] Rewarded error:', error);
      setRewardedReady(false);
      // Retry after delay
      setTimeout(loadRewarded, 5000);
    });

    ad.load();
  };

  const showInterstitial = useCallback(async () => {
    if (!isMobile) {
      console.log('[AdMob] Interstitial: Web/dev mode - skipped');
      return;
    }

    if (interstitialAd && isInterstitialReady) {
      try {
        await interstitialAd.show();
        console.log('[AdMob] Interstitial shown');
      } catch (e) {
        console.error('[AdMob] Show interstitial error:', e);
      }
    } else {
      console.log('[AdMob] Interstitial not ready');
    }
  }, [interstitialAd, isInterstitialReady]);

  const showRewarded = useCallback(async (onRewarded: () => void): Promise<boolean> => {
    if (!isMobile) {
      console.log('[AdMob] Rewarded: Web/dev mode - granting reward');
      onRewarded();
      return true;
    }

    if (rewardedAd && isRewardedReady) {
      return new Promise((resolve) => {
        // Listen for reward earned
        const unsubscribe = rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          () => {
            console.log('[AdMob] Reward earned!');
            onRewarded();
            unsubscribe();
            resolve(true);
          }
        );

        // Show the ad
        rewardedAd.show().catch((e: any) => {
          console.error('[AdMob] Show rewarded error:', e);
          unsubscribe();
          resolve(false);
        });
      });
    } else {
      console.log('[AdMob] Rewarded not ready');
      return false;
    }
  }, [rewardedAd, isRewardedReady]);

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
