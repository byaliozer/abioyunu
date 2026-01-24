const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Bu plugin package name uyuşmazlığını düzeltir.
 * Expo bazen yanlış package name oluşturuyor (com.busegame.abii yerine com.busegame.abi olmalı)
 */
const withPackageNameFix = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidDir = path.join(projectRoot, 'android');
      const javaDir = path.join(androidDir, 'app/src/main/java/com/busegame/abi');

      const filesToFix = ['MainActivity.kt', 'MainApplication.kt'];

      for (const fileName of filesToFix) {
        const filePath = path.join(javaDir, fileName);
        
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf8');
          
          // Fix wrong package name
          if (content.includes('package com.busegame.abii')) {
            content = content.replace(/package com\.busegame\.abii/g, 'package com.busegame.abi');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`[withPackageNameFix] Fixed package name in ${fileName}`);
          }
        }
      }

      return config;
    },
  ]);
};

module.exports = withPackageNameFix;
