const { withMainActivity, withMainApplication, withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Custom Expo Config Plugin to:
 * 1. Remove BuildConfig imports and usages
 * 2. Fix boolean values (remove quotes from "true"/"false")
 * 3. Fix null values (remove quotes from "null")
 * 4. Fix uppercase() compatibility
 * 5. Add Locale import
 */

function withRemoveBuildConfigReferences(config) {
  // Modify MainActivity.kt
  config = withMainActivity(config, (config) => {
    if (config.modResults.language === 'kotlin' || config.modResults.language === 'kt') {
      let contents = config.modResults.contents;
      
      // Remove BuildConfig import
      contents = contents.replace(/import\s+com\.busegame\.abi\.BuildConfig\s*\n?/g, '');
      contents = contents.replace(/import\s+[a-zA-Z0-9_.]+\.BuildConfig\s*\n?/g, '');
      
      // Replace BuildConfig.DEBUG with boolean false (not string)
      contents = contents.replace(/BuildConfig\.DEBUG/g, 'false');
      
      // Fix quoted booleans - "true" -> true, "false" -> false
      contents = contents.replace(/=\s*"true"/g, '= true');
      contents = contents.replace(/=\s*"false"/g, '= false');
      
      // Fix quoted null - "null" -> null
      contents = contents.replace(/\("null"\)/g, '(null)');
      contents = contents.replace(/super\.onCreate\("null"\)/g, 'super.onCreate(null)');
      
      // Fix uppercase() -> uppercase() with Locale for compatibility
      // Keep .uppercase() as is since Kotlin 1.5+ supports it
      
      config.modResults.contents = contents;
    }
    return config;
  });

  // Modify MainApplication.kt
  config = withMainApplication(config, (config) => {
    if (config.modResults.language === 'kotlin' || config.modResults.language === 'kt') {
      let contents = config.modResults.contents;
      
      // Remove BuildConfig import
      contents = contents.replace(/import\s+com\.busegame\.abi\.BuildConfig\s*\n?/g, '');
      contents = contents.replace(/import\s+[a-zA-Z0-9_.]+\.BuildConfig\s*\n?/g, '');
      
      // Replace BuildConfig.DEBUG with boolean false (not string)
      contents = contents.replace(/BuildConfig\.DEBUG/g, 'false');
      
      // Fix quoted booleans - "true" -> true, "false" -> false
      contents = contents.replace(/=\s*"true"/g, '= true');
      contents = contents.replace(/=\s*"false"/g, '= false');
      
      // Fix isNewArchEnabled and isHermesEnabled specifically
      contents = contents.replace(/override\s+val\s+isNewArchEnabled\s*=\s*"[^"]*"/g, 'override val isNewArchEnabled = false');
      contents = contents.replace(/override\s+val\s+isHermesEnabled\s*=\s*"[^"]*"/g, 'override val isHermesEnabled = true');
      
      // Fix quoted null
      contents = contents.replace(/\("null"\)/g, '(null)');
      
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
