const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * Config plugin to enable BuildConfig generation in Android builds
 * This patches android/app/build.gradle (module-level, NOT root)
 */
const withBuildConfig = (config) => {
  // 1. Modify android/app/build.gradle to add buildFeatures { buildConfig true }
  config = withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    
    // Check if already has buildConfig
    if (contents.includes('buildConfig true') || contents.includes('buildConfig = true')) {
      return config;
    }
    
    // Replace android { with android { buildFeatures { buildConfig true } }
    config.modResults.contents = contents.replace(
      /android\s*\{/,
      `android {
    buildFeatures {
        buildConfig true
    }`
    );
    
    return config;
  });

  // 2. Also add to gradle.properties as fallback
  config = withGradleProperties(config, (config) => {
    config.modResults.push({
      type: 'property',
      key: 'android.defaults.buildfeatures.buildconfig',
      value: 'true',
    });
    return config;
  });

  return config;
};

module.exports = withBuildConfig;
