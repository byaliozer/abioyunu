const { withMainActivity, withMainApplication, withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Custom Expo Config Plugin to:
 * 1. Remove BuildConfig imports and usages from MainActivity.kt and MainApplication.kt
 * 2. Ensure buildConfig feature is enabled in build.gradle
 */

function withRemoveBuildConfigReferences(config) {
  // Modify MainActivity.kt to remove BuildConfig references
  config = withMainActivity(config, (config) => {
    if (config.modResults.language === 'kotlin' || config.modResults.language === 'kt') {
      let contents = config.modResults.contents;
      
      // Remove BuildConfig import
      contents = contents.replace(/import\s+com\.busegame\.abi\.BuildConfig\s*\n?/g, '');
      contents = contents.replace(/import\s+[a-zA-Z0-9_.]+\.BuildConfig\s*\n?/g, '');
      
      // Remove BuildConfig.DEBUG usages - replace with false or remove the condition
      contents = contents.replace(/BuildConfig\.DEBUG/g, 'false');
      contents = contents.replace(/BuildConfig\.[A-Z_]+/g, 'false');
      
      config.modResults.contents = contents;
    }
    return config;
  });

  // Modify MainApplication.kt to remove BuildConfig references
  config = withMainApplication(config, (config) => {
    if (config.modResults.language === 'kotlin' || config.modResults.language === 'kt') {
      let contents = config.modResults.contents;
      
      // Remove BuildConfig import
      contents = contents.replace(/import\s+com\.busegame\.abi\.BuildConfig\s*\n?/g, '');
      contents = contents.replace(/import\s+[a-zA-Z0-9_.]+\.BuildConfig\s*\n?/g, '');
      
      // Remove BuildConfig.DEBUG usages - replace with false
      contents = contents.replace(/BuildConfig\.DEBUG/g, 'false');
      contents = contents.replace(/BuildConfig\.[A-Z_]+/g, 'false');
      
      config.modResults.contents = contents;
    }
    return config;
  });

  // Ensure buildConfig is enabled in app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let contents = config.modResults.contents;

      // Add buildFeatures block if not present
      if (!contents.includes('buildConfig = true') && !contents.includes('buildConfig true')) {
        // Find android block and add buildFeatures
        contents = contents.replace(
          /(android\s*\{)/,
          `$1
    buildFeatures {
        buildConfig = true
    }`
        );
      }

      config.modResults.contents = contents;
    }
    return config;
  });

  return config;
}

module.exports = withRemoveBuildConfigReferences;
