const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * Bu plugin Android build yapılandırmasını düzelterek BuildConfig sınıfının 
 * oluşturulmasını sağlar.
 * 
 * Android Gradle Plugin 8.x'de BuildConfig varsayılan olarak kapalıdır.
 * Bu plugin buildFeatures.buildConfig = true ayarını ekler.
 */

const withBuildConfigFix = (config) => {
  // 1. app/build.gradle'a buildFeatures ekle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let contents = config.modResults.contents;

      // buildFeatures bloğu var mı kontrol et
      if (!contents.includes('buildConfig = true') && !contents.includes('buildConfig true')) {
        // android { } bloğunun hemen başına buildFeatures ekle
        const androidBlockRegex = /(android\s*\{)/;
        
        if (androidBlockRegex.test(contents)) {
          contents = contents.replace(
            androidBlockRegex,
            `$1
    buildFeatures {
        buildConfig = true
    }
`
          );
          console.log('[withBuildConfigFix] Added buildFeatures { buildConfig = true } to app/build.gradle');
        }
      }

      config.modResults.contents = contents;
    }
    return config;
  });

  // 2. gradle.properties'e varsayılan BuildConfig ayarını ekle
  config = withGradleProperties(config, (config) => {
    const buildConfigProperty = 'android.defaults.buildfeatures.buildconfig';
    
    // Bu property zaten var mı kontrol et
    const existingIndex = config.modResults.findIndex(
      (item) => item.type === 'property' && item.key === buildConfigProperty
    );

    if (existingIndex === -1) {
      // Yoksa ekle
      config.modResults.push({
        type: 'property',
        key: buildConfigProperty,
        value: 'true',
      });
      console.log('[withBuildConfigFix] Added android.defaults.buildfeatures.buildconfig=true to gradle.properties');
    } else {
      // Varsa true olarak güncelle
      config.modResults[existingIndex].value = 'true';
    }

    return config;
  });

  return config;
};

module.exports = withBuildConfigFix;
