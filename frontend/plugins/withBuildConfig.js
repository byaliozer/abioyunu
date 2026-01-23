const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * This plugin enables BuildConfig generation which is disabled by default
 * in newer versions of Android Gradle Plugin.
 */
function withBuildConfig(config) {
  // Add gradle property
  config = withGradleProperties(config, (config) => {
    config.modResults.push({
      type: 'property',
      key: 'android.defaults.buildfeatures.buildconfig',
      value: 'true',
    });
    return config;
  });

  // Modify app/build.gradle to enable buildConfig
  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    // Check if buildFeatures block exists
    if (buildGradle.includes('buildFeatures {')) {
      // Add buildConfig = true if not already present
      if (!buildGradle.includes('buildConfig')) {
        config.modResults.contents = buildGradle.replace(
          /buildFeatures\s*\{/,
          'buildFeatures {\n        buildConfig = true'
        );
      }
    } else {
      // Add buildFeatures block in android block
      config.modResults.contents = buildGradle.replace(
        /android\s*\{/,
        'android {\n    buildFeatures {\n        buildConfig = true\n    }'
      );
    }
    
    return config;
  });

  return config;
}

module.exports = withBuildConfig;
