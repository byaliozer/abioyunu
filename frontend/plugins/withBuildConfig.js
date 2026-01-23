const { withAppBuildGradle, withGradleProperties, withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Comprehensive plugin to enable BuildConfig generation.
 * This is required for newer Android Gradle Plugin versions where
 * buildConfig generation is disabled by default.
 */
function withBuildConfig(config) {
  // 1. Add gradle property to gradle.properties
  config = withGradleProperties(config, (config) => {
    const buildConfigProp = {
      type: 'property',
      key: 'android.defaults.buildfeatures.buildconfig',
      value: 'true',
    };
    
    // Remove existing property if present
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'android.defaults.buildfeatures.buildconfig')
    );
    
    // Add property
    config.modResults.push(buildConfigProp);
    
    return config;
  });

  // 2. Modify project-level build.gradle to ensure buildConfig is enabled
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    
    // Add allprojects block with buildFeatures if not present
    if (!contents.includes('android.buildFeatures.buildConfig')) {
      const allProjectsBlock = `
allprojects {
    afterEvaluate { project ->
        if (project.hasProperty('android')) {
            project.android {
                buildFeatures {
                    buildConfig = true
                }
            }
        }
    }
}
`;
      // Add before the last closing brace
      contents = contents.trimEnd();
      if (contents.endsWith('}')) {
        contents = contents.slice(0, -1) + allProjectsBlock + '\n}';
      } else {
        contents = contents + '\n' + allProjectsBlock;
      }
      config.modResults.contents = contents;
    }
    
    return config;
  });

  // 3. Modify app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    
    // Find android block and add buildFeatures
    if (!contents.includes('buildFeatures')) {
      contents = contents.replace(
        /android\s*\{/,
        `android {
    buildFeatures {
        buildConfig = true
    }`
      );
    } else if (!contents.includes('buildConfig = true') && !contents.includes('buildConfig true')) {
      // buildFeatures exists but buildConfig is not set
      contents = contents.replace(
        /buildFeatures\s*\{/,
        'buildFeatures {\n        buildConfig = true'
      );
    }
    
    config.modResults.contents = contents;
    return config;
  });

  return config;
}

module.exports = withBuildConfig;
