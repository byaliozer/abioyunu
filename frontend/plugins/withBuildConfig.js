const { withMainActivity, withMainApplication, withAppBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Bu plugin BuildConfig referanslarını tamamen kaldırır
 * Çünkü Expo New Architecture projelerinde BuildConfig bazen generate edilmiyor
 */

function withRemoveBuildConfig(config) {
  // Dangerous mod ile doğrudan dosyaları değiştir
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidDir = path.join(projectRoot, 'android');
      
      // MainActivity.kt dosyasını düzelt
      const mainActivityPath = path.join(
        androidDir,
        'app/src/main/java/com/busegame/abi/MainActivity.kt'
      );
      
      if (fs.existsSync(mainActivityPath)) {
        let content = fs.readFileSync(mainActivityPath, 'utf8');
        
        // BuildConfig.DEBUG kullanımını kaldır ve sabit değerle değiştir
        content = content.replace(/BuildConfig\.DEBUG/g, 'false');
        content = content.replace(/BuildConfig\.[A-Z_]+/g, 'false');
        
        // BuildConfig import satırını kaldır
        content = content.replace(/import\s+.*\.BuildConfig\s*\n?/g, '');
        
        fs.writeFileSync(mainActivityPath, content);
        console.log('[withRemoveBuildConfig] MainActivity.kt düzeltildi');
      }
      
      // MainApplication.kt dosyasını düzelt
      const mainApplicationPath = path.join(
        androidDir,
        'app/src/main/java/com/busegame/abi/MainApplication.kt'
      );
      
      if (fs.existsSync(mainApplicationPath)) {
        let content = fs.readFileSync(mainApplicationPath, 'utf8');
        
        // BuildConfig.DEBUG kullanımını kaldır
        content = content.replace(/BuildConfig\.DEBUG/g, 'false');
        content = content.replace(/BuildConfig\.[A-Z_]+/g, 'false');
        
        // BuildConfig import satırını kaldır
        content = content.replace(/import\s+.*\.BuildConfig\s*\n?/g, '');
        
        fs.writeFileSync(mainApplicationPath, content);
        console.log('[withRemoveBuildConfig] MainApplication.kt düzeltildi');
      }
      
      return config;
    },
  ]);

  return config;
}

module.exports = withRemoveBuildConfig;
