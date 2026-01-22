// Re-export platform-specific implementation
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  module.exports = require('./AdContext.web');
} else {
  module.exports = require('./AdContext.native');
}

export * from './AdContext.web';
