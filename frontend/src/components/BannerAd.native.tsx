import React, { useState } from 'react';
import { Platform, StyleSheet, View, ViewStyle, Text } from 'react-native';
import { BannerAd as GoogleBannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface BannerAdProps {
  style?: ViewStyle;
}

// Production Banner Ad Unit ID
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-9873123247401502/7990230026',
      android: 'ca-app-pub-9873123247401502/7990230026',
    }) || TestIds.BANNER;

export function BannerAd({ style }: BannerAdProps) {
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  if (!isMobile) {
    // Return placeholder for web
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Reklam Alanı</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {!adLoaded && !adError && (
        <View style={styles.loadingPlaceholder}>
          <Text style={styles.loadingText}>Reklam yükleniyor...</Text>
        </View>
      )}
      <GoogleBannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('[AdMob] Banner ad loaded');
          setAdLoaded(true);
          setAdError(false);
        }}
        onAdFailedToLoad={(error) => {
          console.error('[AdMob] Banner ad failed to load:', error);
          setAdError(true);
          setAdLoaded(false);
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
    backgroundColor: '#1a1a2e',
  },
  placeholder: {
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
  },
  loadingPlaceholder: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'absolute',
  },
  loadingText: {
    color: '#666',
    fontSize: 12,
  },
});
