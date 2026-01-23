const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Add buildFeatures { buildConfig true } to android/app/build.gradle
 */
const withBuildConfig = (config) => {
  return withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // Check if buildConfig is already set
    if (buildGradle.includes('buildConfig true') || buildGradle.includes('buildConfig = true')) {
      return config;
    }
    
    // Find the android { block and add buildFeatures after it
    const androidBlockRegex = /android\s*\{/;
    const match = buildGradle.match(androidBlockRegex);
    
    if (match) {
      const insertPosition = buildGradle.indexOf(match[0]) + match[0].length;
      const before = buildGradle.substring(0, insertPosition);
      const after = buildGradle.substring(insertPosition);
      
      buildGradle = before + `
    buildFeatures {
        buildConfig true
    }` + after;
      
      config.modResults.contents = buildGradle;
    }
    
    return config;
  });
};

module.exports = withBuildConfig;
