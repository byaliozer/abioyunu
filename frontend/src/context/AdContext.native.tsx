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

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isInterstitialReady, setInterstitialReady] = useState(false);
  const [isRewardedReady, setRewardedReady] = useState(false);
  const [interstitialAd, setInterstitialAd] = useState<any>(null);
  const [rewardedAd, setRewardedAd] = useState<any>(null);
  const [adsModule, setAdsModule] = useState<any>(null);

  useEffect(() => {
    const initAds = async () => {
      try {
        // Dynamically import to prevent crash if module fails
        const MobileAdsModule = await import('react-native-google-mobile-ads');
        const MobileAds = MobileAdsModule.default;
        const { InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType } = MobileAdsModule;
        
        setAdsModule({ InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType });
        
        await MobileAds().initialize();
        console.log('[AdMob] Initialized successfully');
        
        // Load Interstitial
        loadInterstitialAd(InterstitialAd, AdEventType);
        
        // Load Rewarded
        loadRewardedAd(RewardedAd, AdEventType, RewardedAdEventType);
        
      } catch (e) {
        console.error('[AdMob] Init error:', e);
        // Don't crash - ads just won't work
      }
    };
    
    initAds();
  }, []);

  const loadInterstitialAd = (InterstitialAd: any, AdEventType: any) => {
    try {
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
        setTimeout(() => loadInterstitialAd(InterstitialAd, AdEventType), 1000);
      });

      ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.error('[AdMob] Interstitial error:', error);
        setInterstitialReady(false);
        setTimeout(() => loadInterstitialAd(InterstitialAd, AdEventType), 5000);
      });

      ad.load();
    } catch (e) {
      console.error('[AdMob] Load interstitial error:', e);
    }
  };

  const loadRewardedAd = (RewardedAd: any, AdEventType: any, RewardedAdEventType: any) => {
    try {
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
        setTimeout(() => loadRewardedAd(RewardedAd, AdEventType, RewardedAdEventType), 1000);
      });

      ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.error('[AdMob] Rewarded error:', error);
        setRewardedReady(false);
        setTimeout(() => loadRewardedAd(RewardedAd, AdEventType, RewardedAdEventType), 5000);
      });

      ad.load();
    } catch (e) {
      console.error('[AdMob] Load rewarded error:', e);
    }
  };

  const showInterstitial = useCallback(async () => {
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
    if (rewardedAd && isRewardedReady && adsModule) {
      return new Promise((resolve) => {
        try {
          const unsubscribe = rewardedAd.addAdEventListener(
            adsModule.RewardedAdEventType.EARNED_REWARD,
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
        } catch (e) {
          console.error('[AdMob] Rewarded error:', e);
          resolve(false);
        }
      });
    } else {
      console.log('[AdMob] Rewarded not ready');
      return false;
    }
  }, [rewardedAd, isRewardedReady, adsModule]);

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
