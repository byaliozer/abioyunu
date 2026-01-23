const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * Comprehensive plugin to enable BuildConfig generation
 * Based on ChatGPT recommendation for AGP where BuildConfig is disabled by default
 */

// Step 1: Add buildFeatures { buildConfig true } to android/app/build.gradle
const withBuildConfigGradle = (config) => {
  return withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // Check if buildConfig is already set
    if (buildGradle.includes('buildConfig true') || buildGradle.includes('buildConfig = true')) {
      console.log('[withBuildConfig] buildConfig already enabled in build.gradle');
      return config;
    }
    
    // Check if buildFeatures block exists
    if (buildGradle.includes('buildFeatures {')) {
      // Add buildConfig true inside existing buildFeatures block
      buildGradle = buildGradle.replace(
        /buildFeatures\s*\{/,
        'buildFeatures {\n        buildConfig true'
      );
    } else {
      // Add buildFeatures block inside android block
      // Find android { and add buildFeatures right after it
      buildGradle = buildGradle.replace(
        /android\s*\{/,
        'android {\n    buildFeatures {\n        buildConfig true\n    }'
      );
    }
    
    config.modResults.contents = buildGradle;
    console.log('[withBuildConfig] Added buildFeatures { buildConfig true } to build.gradle');
    return config;
  });
};

// Step 2: Add android.defaults.buildfeatures.buildconfig=true to gradle.properties
const withBuildConfigProperties = (config) => {
  return withGradleProperties(config, (config) => {
    const key = 'android.defaults.buildfeatures.buildconfig';
    
    // Remove existing property if present
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === key)
    );
    
    // Add the property
    config.modResults.push({
      type: 'property',
      key: key,
      value: 'true',
    });
    
    console.log('[withBuildConfig] Added android.defaults.buildfeatures.buildconfig=true to gradle.properties');
    return config;
  });
};

// Combined plugin
const withBuildConfig = (config) => {
  config = withBuildConfigGradle(config);
  config = withBuildConfigProperties(config);
  return config;
};

module.exports = withBuildConfig;
