const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * Simple config plugin to enable BuildConfig generation
 */
const withBuildConfig = (config) => {
  // 1. Add to gradle.properties
  config = withGradleProperties(config, (propsConfig) => {
    const existingProp = propsConfig.modResults.find(
      (item) => item.key === 'android.defaults.buildfeatures.buildconfig'
    );
    
    if (!existingProp) {
      propsConfig.modResults.push({
        type: 'property',
        key: 'android.defaults.buildfeatures.buildconfig',
        value: 'true',
      });
    }
    
    return propsConfig;
  });

  // 2. Add buildFeatures to build.gradle
  config = withAppBuildGradle(config, (gradleConfig) => {
    let contents = gradleConfig.modResults.contents;
    
    if (!contents.includes('buildConfig true') && !contents.includes('buildConfig = true')) {
      contents = contents.replace(
        /android\s*\{/,
        `android {\n    buildFeatures {\n        buildConfig true\n    }`
      );
      gradleConfig.modResults.contents = contents;
    }
    
    return gradleConfig;
  });

  return config;
};

module.exports = withBuildConfig;
