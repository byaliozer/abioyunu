import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
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

// Production Ad Unit IDs - Update with your actual IDs
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios: 'ca-app-pub-9873123247401502/1234567890', // Replace with your iOS interstitial ID
      android: 'ca-app-pub-9873123247401502/1234567890', // Replace with your Android interstitial ID
    }) || TestIds.INTERSTITIAL;

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : Platform.select({
      ios: 'ca-app-pub-9873123247401502/0987654321', // Replace with your iOS rewarded ID
      android: 'ca-app-pub-9873123247401502/0987654321', // Replace with your Android rewarded ID
    }) || TestIds.REWARDED;

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isInterstitialReady, setIsInterstitialReady] = useState(false);
  const [isRewardedReady, setIsRewardedReady] = useState(false);
  const [interstitialAd, setInterstitialAd] = useState<InterstitialAd | null>(null);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  // Initialize Mobile Ads SDK
  useEffect(() => {
    const initializeAds = async () => {
      try {
        await mobileAds().initialize();
        console.log('[AdMob] SDK initialized successfully');
        loadInterstitialAd();
        loadRewardedAd();
      } catch (error) {
        console.error('[AdMob] SDK initialization error:', error);
      }
    };

    if (isMobile) {
      initializeAds();
    }
  }, []);

  // Load Interstitial Ad
  const loadInterstitialAd = useCallback(() => {
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
      // Load next ad
      loadInterstitialAd();
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('[AdMob] Interstitial error:', error);
      setIsInterstitialReady(false);
    });

    setInterstitialAd(ad);
    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  // Load Rewarded Ad
  const loadRewardedAd = useCallback(() => {
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
      // Load next ad
      loadRewardedAd();
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('[AdMob] Rewarded ad error:', error);
      setIsRewardedReady(false);
    });

    setRewardedAd(ad);
    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  // Show Interstitial Ad
  const showInterstitial = useCallback(async () => {
    if (!isMobile) {
      console.log('[AdMob] Interstitial: Not available on web');
      return;
    }

    if (interstitialAd && isInterstitialReady) {
      try {
        await interstitialAd.show();
        console.log('[AdMob] Interstitial shown');
      } catch (error) {
        console.error('[AdMob] Interstitial show error:', error);
      }
    } else {
      console.log('[AdMob] Interstitial not ready');
    }
  }, [interstitialAd, isInterstitialReady]);

  // Show Rewarded Ad
  const showRewarded = useCallback(async (onRewarded: () => void): Promise<boolean> => {
    if (!isMobile) {
      console.log('[AdMob] Rewarded: Not available on web');
      onRewarded();
      return true;
    }

    if (rewardedAd && isRewardedReady) {
      return new Promise((resolve) => {
        const unsubscribeEarned = rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward) => {
            console.log('[AdMob] Reward earned:', reward);
            onRewarded();
            unsubscribeEarned();
            resolve(true);
          }
        );

        rewardedAd.show().catch((error) => {
          console.error('[AdMob] Rewarded show error:', error);
          unsubscribeEarned();
          resolve(false);
        });
      });
    } else {
      console.log('[AdMob] Rewarded ad not ready');
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
