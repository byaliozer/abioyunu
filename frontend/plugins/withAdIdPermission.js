const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Bu plugin AD_ID iznini AndroidManifest.xml'e ekler.
 * react-native-google-mobile-ads bunu otomatik yapması gerekiyor, ama
 * bu plugin ekstra güvence sağlar.
 */
const withAdIdPermission = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // uses-permission array'ini oluştur
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const permissions = manifest['uses-permission'];

    // AD_ID izni var mı kontrol et
    const adIdPermission = 'com.google.android.gms.permission.AD_ID';
    const hasAdIdPermission = permissions.some(
      (perm) => perm.$?.['android:name'] === adIdPermission
    );

    if (!hasAdIdPermission) {
      permissions.push({
        $: {
          'android:name': adIdPermission,
        },
      });
      console.log('[withAdIdPermission] Added AD_ID permission to AndroidManifest.xml');
    } else {
      console.log('[withAdIdPermission] AD_ID permission already exists');
    }

    return config;
  });
};

module.exports = withAdIdPermission;
