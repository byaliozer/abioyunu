import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd as GoogleBannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { ADMOB_IDS, TEST_IDS } from '../config/admob';

interface BannerAdProps {
  style?: object;
}

export function BannerAd({ style }: BannerAdProps) {
  const adUnitId = __DEV__ ? TEST_IDS.BANNER_ID : ADMOB_IDS.BANNER_ID;
  
  return (
    <View style={[styles.container, style]}>
      <GoogleBannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => console.log('[AdMob] Banner loaded')}
        onAdFailedToLoad={(error) => console.log('[AdMob] Banner error:', error)}
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
});
