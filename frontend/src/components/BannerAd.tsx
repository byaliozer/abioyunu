import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface BannerAdProps {
  style?: object;
}

// Web/development version - placeholder
export function BannerAd({ style }: BannerAdProps) {
  // On web, show placeholder
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.placeholderText}>Reklam Alanı</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
