import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ADMOB_IDS, TEST_IDS } from '../config/admob';

interface BannerAdProps {
  style?: object;
}

// Check if running on mobile
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Try to import mobile banner component only on native
let BannerAdComponent: any = null;
let BannerAdSize: any = null;

// Only require on native platforms
if (isMobile) {
  try {
    // Dynamic require to prevent web bundling issues
    const mobileAdsModule = require('react-native-google-mobile-ads');
    BannerAdComponent = mobileAdsModule.BannerAd;
    BannerAdSize = mobileAdsModule.BannerAdSize;
  } catch (e) {
    console.log('[AdMob] Banner module not available');
  }
}

export function BannerAd({ style }: BannerAdProps) {
  // If on mobile and module is available, show real ad
  if (isMobile && BannerAdComponent && BannerAdSize) {
    const adUnitId = __DEV__ ? TEST_IDS.BANNER_ID : ADMOB_IDS.BANNER_ID;
    
    return (
      <View style={[styles.container, style]}>
        <BannerAdComponent
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdLoaded={() => console.log('[AdMob] Banner loaded')}
          onAdFailedToLoad={(error: any) => console.log('[AdMob] Banner error:', error)}
        />
      </View>
    );
  }

  // Fallback for web/development - ALWAYS show placeholder
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.placeholderText}>Reklam Alanı</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  placeholder: {
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  },
  placeholderText: {
    color: '#888',
    fontSize: 12,
  },
});
