const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * Simple plugin to enable BuildConfig generation.
 */
function withBuildConfig(config) {
  // 1. Add gradle property to gradle.properties
  config = withGradleProperties(config, (config) => {
    // Remove existing property if present
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'android.defaults.buildfeatures.buildconfig')
    );
    
    // Add property
    config.modResults.push({
      type: 'property',
      key: 'android.defaults.buildfeatures.buildconfig',
      value: 'true',
    });
    
    return config;
  });

  // 2. Modify app/build.gradle to add buildFeatures block
  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    
    // Check if buildFeatures block already exists
    if (contents.includes('buildFeatures {')) {
      // Add buildConfig = true if not present
      if (!contents.includes('buildConfig = true') && !contents.includes('buildConfig true')) {
        contents = contents.replace(
          /buildFeatures\s*\{/,
          'buildFeatures {\n        buildConfig = true'
        );
      }
    } else {
      // Find the android block and add buildFeatures after the first opening brace
      const androidBlockMatch = contents.match(/android\s*\{/);
      if (androidBlockMatch) {
        const insertIndex = contents.indexOf(androidBlockMatch[0]) + androidBlockMatch[0].length;
        const beforeAndroid = contents.substring(0, insertIndex);
        const afterAndroid = contents.substring(insertIndex);
        contents = beforeAndroid + '\n    buildFeatures {\n        buildConfig = true\n    }' + afterAndroid;
      }
    }
    
    config.modResults.contents = contents;
    return config;
  });

  return config;
}

module.exports = withBuildConfig;
