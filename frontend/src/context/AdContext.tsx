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

// Check if running on mobile - this is checked at runtime
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isInterstitialReady, setInterstitialReady] = useState(false);
  const [isRewardedReady, setRewardedReady] = useState(false);
  const [adModule, setAdModule] = useState<any>(null);
  const [interstitialAd, setInterstitialAd] = useState<any>(null);
  const [rewardedAd, setRewardedAd] = useState<any>(null);

  // Initialize ads on mobile only
  useEffect(() => {
    if (!isMobile) {
      console.log('[AdMob] Running on web - ads disabled');
      return;
    }

    // Dynamically import the ads module only on mobile
    const initAds = async () => {
      try {
        // Dynamic import for mobile only
        const mobileAdsModule = await import('react-native-google-mobile-ads');
        setAdModule(mobileAdsModule);
        
        // Initialize MobileAds
        await mobileAdsModule.default().initialize();
        console.log('[AdMob] Initialized successfully');
        
        // Load initial ads
        loadInterstitialWithModule(mobileAdsModule);
        loadRewardedWithModule(mobileAdsModule);
      } catch (e) {
        console.error('[AdMob] Init error:', e);
      }
    };

    initAds();
  }, []);

  const loadInterstitialWithModule = (module: any) => {
    if (!module?.InterstitialAd) return;

    const adUnitId = __DEV__ ? TEST_IDS.INTERSTITIAL_ID : ADMOB_IDS.INTERSTITIAL_ID;
    const ad = module.InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    ad.addAdEventListener(module.AdEventType.LOADED, () => {
      console.log('[AdMob] Interstitial loaded');
      setInterstitialReady(true);
      setInterstitialAd(ad);
    });

    ad.addAdEventListener(module.AdEventType.CLOSED, () => {
      console.log('[AdMob] Interstitial closed');
      setInterstitialReady(false);
      setInterstitialAd(null);
      setTimeout(() => loadInterstitialWithModule(module), 1000);
    });

    ad.addAdEventListener(module.AdEventType.ERROR, (error: any) => {
      console.error('[AdMob] Interstitial error:', error);
      setInterstitialReady(false);
      setTimeout(() => loadInterstitialWithModule(module), 5000);
    });

    ad.load();
  };

  const loadRewardedWithModule = (module: any) => {
    if (!module?.RewardedAd) return;

    const adUnitId = __DEV__ ? TEST_IDS.REWARDED_ID : ADMOB_IDS.REWARDED_ID;
    const ad = module.RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    ad.addAdEventListener(module.RewardedAdEventType.LOADED, () => {
      console.log('[AdMob] Rewarded loaded');
      setRewardedReady(true);
      setRewardedAd(ad);
    });

    ad.addAdEventListener(module.RewardedAdEventType.CLOSED, () => {
      console.log('[AdMob] Rewarded closed');
      setRewardedReady(false);
      setRewardedAd(null);
      setTimeout(() => loadRewardedWithModule(module), 1000);
    });

    ad.addAdEventListener(module.AdEventType.ERROR, (error: any) => {
      console.error('[AdMob] Rewarded error:', error);
      setRewardedReady(false);
      setTimeout(() => loadRewardedWithModule(module), 5000);
    });

    ad.load();
  };

  const showInterstitial = useCallback(async () => {
    if (!isMobile) {
      console.log('[AdMob] Interstitial: Web mode - skipped');
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
      console.log('[AdMob] Rewarded: Web mode - granting reward for testing');
      onRewarded();
      return true;
    }

    if (rewardedAd && isRewardedReady && adModule) {
      return new Promise((resolve) => {
        const unsubscribe = rewardedAd.addAdEventListener(
          adModule.RewardedAdEventType.EARNED_REWARD,
          () => {
            console.log('[AdMob] Reward earned!');
            onRewarded();
            unsubscribe();
            resolve(true);
          }
        );

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
  }, [rewardedAd, isRewardedReady, adModule]);

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
