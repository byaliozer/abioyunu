/**
 * AdMob Configuration - ABİ OYUNU
 * 
 * Production Ad Unit IDs:
 * - App ID: ca-app-pub-9873123247401502~8867540882
 * - Banner: ca-app-pub-9873123247401502/7990230026
 * - Interstitial: ca-app-pub-9873123247401502/4006096444
 * - Rewarded: ca-app-pub-9873123247401502/4006096444
 */

import { Platform } from 'react-native';

// Production Ad IDs
export const ADMOB_IDS = {
  APP_ID: 'ca-app-pub-9873123247401502~8867540882',
  BANNER_ID: 'ca-app-pub-9873123247401502/7990230026',
  INTERSTITIAL_ID: 'ca-app-pub-9873123247401502/4006096444',
  REWARDED_ID: 'ca-app-pub-9873123247401502/4006096444',
};

// Test IDs for development (Google's official test IDs)
export const TEST_IDS = {
  BANNER_ID: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL_ID: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED_ID: 'ca-app-pub-3940256099942544/5224354917',
};

// Get appropriate ad ID based on environment
export const getAdId = (type: 'banner' | 'interstitial' | 'rewarded', useTestAds = false) => {
  if (useTestAds || __DEV__) {
    switch (type) {
      case 'banner': return TEST_IDS.BANNER_ID;
      case 'interstitial': return TEST_IDS.INTERSTITIAL_ID;
      case 'rewarded': return TEST_IDS.REWARDED_ID;
    }
  }
  switch (type) {
    case 'banner': return ADMOB_IDS.BANNER_ID;
    case 'interstitial': return ADMOB_IDS.INTERSTITIAL_ID;
    case 'rewarded': return ADMOB_IDS.REWARDED_ID;
  }
};

// Check if we're on a mobile platform
export const isMobilePlatform = () => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

export default {
  ADMOB_IDS,
  TEST_IDS,
  getAdId,
  isMobilePlatform,
};
