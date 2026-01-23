import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import MobileAds, {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
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
  const [interstitialAd, setInterstitialAd] = useState<InterstitialAd | null>(null);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  useEffect(() => {
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
    const adUnitId = __DEV__ ? TEST_IDS.INTERSTITIAL_ID : ADMOB_IDS.INTERSTITIAL_ID;
    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[AdMob] Interstitial loaded');
      setInterstitialReady(true);
      setInterstitialAd(ad);
    });

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdMob] Interstitial closed');
      setInterstitialReady(false);
      setInterstitialAd(null);
      setTimeout(loadInterstitial, 1000);
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('[AdMob] Interstitial error:', error);
      setInterstitialReady(false);
      setTimeout(loadInterstitial, 5000);
    });

    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  };

  const loadRewarded = () => {
    const adUnitId = __DEV__ ? TEST_IDS.REWARDED_ID : ADMOB_IDS.REWARDED_ID;
    const ad = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('[AdMob] Rewarded loaded');
      setRewardedReady(true);
      setRewardedAd(ad);
    });

    const unsubscribeClosed = ad.addAdEventListener(RewardedAdEventType.CLOSED, () => {
      console.log('[AdMob] Rewarded closed');
      setRewardedReady(false);
      setRewardedAd(null);
      setTimeout(loadRewarded, 1000);
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('[AdMob] Rewarded error:', error);
      setRewardedReady(false);
      setTimeout(loadRewarded, 5000);
    });

    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
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
    if (rewardedAd && isRewardedReady) {
      return new Promise((resolve) => {
        const unsubscribe = rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          () => {
            console.log('[AdMob] Reward earned!');
            onRewarded();
            unsubscribe();
            resolve(true);
          }
        );

        rewardedAd.show().catch((e) => {
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
