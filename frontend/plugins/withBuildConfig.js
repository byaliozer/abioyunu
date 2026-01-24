const { withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Custom Expo Config Plugin to ensure BuildConfig is properly generated
 * This fixes the "Unresolved reference 'BuildConfig'" error during Android builds
 */

function withBuildConfigGeneration(config) {
  // Modify project-level build.gradle
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      // Ensure kotlin plugin is applied correctly
      if (!config.modResults.contents.includes('org.jetbrains.kotlin.android')) {
        config.modResults.contents = config.modResults.contents.replace(
          /plugins\s*\{/,
          `plugins {
    id 'org.jetbrains.kotlin.android' version '1.9.24' apply false`
        );
      }
    }
    return config;
  });

  // Modify app-level build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let contents = config.modResults.contents;

      // Ensure buildConfig is enabled in android block
      if (!contents.includes('buildConfig = true') && !contents.includes('buildConfig true')) {
        contents = contents.replace(
          /android\s*\{/,
          `android {
    buildFeatures {
        buildConfig = true
    }`
        );
      }

      // Ensure namespace is set (required for BuildConfig generation)
      if (!contents.includes('namespace')) {
        contents = contents.replace(
          /android\s*\{/,
          `android {
    namespace "com.busegame.abi"`
        );
      }

      config.modResults.contents = contents;
    }
    return config;
  });

  return config;
}

module.exports = withBuildConfigGeneration;
