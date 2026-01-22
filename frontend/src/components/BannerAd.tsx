// Re-export platform-specific implementation
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  module.exports = require('./BannerAd.web');
} else {
  module.exports = require('./BannerAd.native');
}

export * from './BannerAd.web';
