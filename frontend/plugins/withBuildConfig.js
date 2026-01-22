const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * Config plugin to enable BuildConfig generation in Android builds
 * This fixes the "Unresolved reference: BuildConfig" error in Expo SDK 54+
 */

function withBuildConfigGradle(config) {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    
    // Check if buildFeatures block already exists
    if (contents.includes('buildFeatures')) {
      // If buildFeatures exists but buildConfig is not set
      if (!contents.includes('buildConfig = true') && !contents.includes('buildConfig true')) {
        config.modResults.contents = contents.replace(
          /buildFeatures\s*\{/,
          'buildFeatures {\n        buildConfig = true'
        );
      }
    } else {
      // Add buildFeatures block inside android block
      config.modResults.contents = contents.replace(
        /android\s*\{/,
        'android {\n    buildFeatures {\n        buildConfig = true\n    }'
      );
    }
    
    return config;
  });
}

function withBuildConfigProperties(config) {
  return withGradleProperties(config, (config) => {
    // Add the gradle property to enable buildConfig
    const buildConfigProp = {
      type: 'property',
      key: 'android.defaults.buildfeatures.buildconfig',
      value: 'true'
    };
    
    // Check if property already exists
    const existingIndex = config.modResults.findIndex(
      (item) => item.type === 'property' && item.key === 'android.defaults.buildfeatures.buildconfig'
    );
    
    if (existingIndex >= 0) {
      config.modResults[existingIndex] = buildConfigProp;
    } else {
      config.modResults.push(buildConfigProp);
    }
    
    return config;
  });
}

module.exports = function withBuildConfig(config) {
  config = withBuildConfigGradle(config);
  config = withBuildConfigProperties(config);
  return config;
};
