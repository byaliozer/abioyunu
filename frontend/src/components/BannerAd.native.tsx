import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BannerAd as GoogleBannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface BannerAdProps {
  style?: ViewStyle;
}

// Production Ad Unit IDs - Update with your actual IDs
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-9873123247401502/1234567890', // Replace with your iOS banner ID
      android: 'ca-app-pub-9873123247401502/1234567890', // Replace with your Android banner ID
    }) || TestIds.BANNER;

export function BannerAd({ style }: BannerAdProps) {
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  if (!isMobile) {
    // Return empty view for web
    return <View style={[styles.placeholder, style]} />;
  }

  return (
    <View style={[styles.container, style]}>
      <GoogleBannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('[AdMob] Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.error('[AdMob] Banner ad failed to load:', error);
        }}
      />
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
    backgroundColor: 'transparent',
    width: '100%',
  },
});
