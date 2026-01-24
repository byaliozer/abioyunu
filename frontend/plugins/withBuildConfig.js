const { withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Bu plugin Android build.gradle dosyalarını modifiye ederek
 * BuildConfig sınıfının oluşturulmasını sağlar.
 * 
 * react-native-google-mobile-ads kütüphanesi BuildConfig referansları 
 * içeren native kod üretiyor, bu yüzden BuildConfig'in generate edilmesi gerekiyor.
 */

const withBuildConfig = (config) => {
  // App-level build.gradle'ı modifiye et
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let contents = config.modResults.contents;

      // buildFeatures bloğu zaten var mı kontrol et
      if (!contents.includes('buildConfig true') && !contents.includes('buildConfig = true')) {
        // android { } bloğunun içine buildFeatures ekle
        // Daha güvenilir regex ile
        const androidBlockRegex = /(android\s*\{)/;
        
        if (androidBlockRegex.test(contents)) {
          contents = contents.replace(
            androidBlockRegex,
            `$1
    buildFeatures {
        buildConfig true
    }
`
          );
        }
      }

      config.modResults.contents = contents;
    }
    return config;
  });

  return config;
};

module.exports = withBuildConfig;
