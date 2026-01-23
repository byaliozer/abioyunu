const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * Config plugin to enable BuildConfig generation in Android builds
 * This patches android/app/build.gradle (module-level, NOT root)
 * 
 * CRITICAL: EAS regenerates android folder on every build, so this plugin
 * must properly inject buildFeatures { buildConfig true } into the generated gradle file
 */
const withBuildConfig = (config) => {
  console.log('[withBuildConfig] Plugin starting...');
  
  // 1. Modify android/app/build.gradle to add buildFeatures { buildConfig true }
  config = withAppBuildGradle(config, (gradleConfig) => {
    console.log('[withBuildConfig] Modifying android/app/build.gradle...');
    
    let contents = gradleConfig.modResults.contents;
    
    // Check if buildFeatures block with buildConfig already exists
    if (contents.includes('buildConfig true') || contents.includes('buildConfig = true')) {
      console.log('[withBuildConfig] buildConfig already exists, skipping...');
      return gradleConfig;
    }
    
    // Check if buildFeatures block exists but without buildConfig
    if (contents.includes('buildFeatures {')) {
      console.log('[withBuildConfig] buildFeatures block exists, adding buildConfig inside...');
      contents = contents.replace(
        /buildFeatures\s*\{/,
        `buildFeatures {\n        buildConfig true`
      );
    } else {
      // No buildFeatures block, add it after android {
      console.log('[withBuildConfig] Adding buildFeatures block after android {...');
      contents = contents.replace(
        /android\s*\{/,
        `android {\n    buildFeatures {\n        buildConfig true\n    }`
      );
    }
    
    gradleConfig.modResults.contents = contents;
    console.log('[withBuildConfig] android/app/build.gradle modified successfully');
    
    return gradleConfig;
  });

  // 2. Also add to gradle.properties as fallback
  config = withGradleProperties(config, (propsConfig) => {
    console.log('[withBuildConfig] Adding to gradle.properties...');
    
    // Check if property already exists
    const existingProp = propsConfig.modResults.find(
      (item) => item.key === 'android.defaults.buildfeatures.buildconfig'
    );
    
    if (!existingProp) {
      propsConfig.modResults.push({
        type: 'property',
        key: 'android.defaults.buildfeatures.buildconfig',
        value: 'true',
      });
      console.log('[withBuildConfig] gradle.properties updated');
    }
    
    return propsConfig;
  });

  console.log('[withBuildConfig] Plugin completed');
  return config;
};

module.exports = withBuildConfig;
