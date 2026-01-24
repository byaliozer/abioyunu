const { withMainActivity, withMainApplication, withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Custom Expo Config Plugin to:
 * 1. ADD BuildConfig import to MainActivity.kt and MainApplication.kt
 * 2. Fix boolean values (remove quotes from "true"/"false")
 * 3. Fix null values (remove quotes from "null")
 * 4. Ensure buildConfig feature is enabled in build.gradle
 */

function withBuildConfigFix(config) {
  // Modify MainActivity.kt - ADD BuildConfig import
  config = withMainActivity(config, (config) => {
    if (config.modResults.language === 'kotlin' || config.modResults.language === 'kt') {
      let contents = config.modResults.contents;
      
      // ADD BuildConfig import if not present
      if (!contents.includes('import com.busegame.abi.BuildConfig')) {
        contents = contents.replace(
          /(package\s+com\.busegame\.abi\s*\n)/,
          '$1\nimport com.busegame.abi.BuildConfig\n'
        );
      }
      
      // Fix quoted booleans - "true" -> true, "false" -> false
      contents = contents.replace(/=\s*"true"/g, '= true');
      contents = contents.replace(/=\s*"false"/g, '= false');
      
      // Fix quoted null - "null" -> null
      contents = contents.replace(/\("null"\)/g, '(null)');
      contents = contents.replace(/super\.onCreate\("null"\)/g, 'super.onCreate(null)');
      
      config.modResults.contents = contents;
    }
    return config;
  });

  // Modify MainApplication.kt - ADD BuildConfig import
  config = withMainApplication(config, (config) => {
    if (config.modResults.language === 'kotlin' || config.modResults.language === 'kt') {
      let contents = config.modResults.contents;
      
      // ADD BuildConfig import if not present
      if (!contents.includes('import com.busegame.abi.BuildConfig')) {
        contents = contents.replace(
          /(package\s+com\.busegame\.abi\s*\n)/,
          '$1\nimport com.busegame.abi.BuildConfig\n'
        );
      }
      
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

      // Add buildFeatures block with buildConfig true
      if (!contents.includes('buildConfig true') && !contents.includes('buildConfig = true')) {
        contents = contents.replace(
          /(android\s*\{)/,
          `$1
    buildFeatures {
        buildConfig true
    }`
        );
      }

      config.modResults.contents = contents;
    }
    return config;
  });

  return config;
}

module.exports = withBuildConfigFix;
