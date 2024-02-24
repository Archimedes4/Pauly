/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: 'Pauly',
    slug: 'Pauly',
    scheme: 'com.Archimedes4.Pauly',
    version: '1.1.1',
    orientation: 'portrait',
    jsEngine: 'hermes',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#793033',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'Archimedes4.Pauly',
      infoPlist: {
        'keychain-access-groups': [
          'com.microsoft.identity.universalstorage',
          'com.microsoft.adalcache',
        ],
        LSApplicationQueriesSchemes: ['msauthv2', 'msauthv3']
      },
      buildNumber: '75'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#793033',
      },
      package: 'com.Archimedes4.Pauly',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'com.Archimedes4.Pauly',
              host: 'auth',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/icon.png',
    },
    extra: {
      eas: {
        projectId: '41b62420-4ae0-49b3-be2c-3eeb912dc208',
      },
    },
    plugins: [
      [
        'expo-router',
        {
          headOrigin:
            process.env.NODE_ENV === 'development'
              ? `https://something.com`
              : process.env.EXPO_PUBLIC_PAULYHOST,
        },
      ],
    ],
    experiments: {
      tsconfigPaths: true,
    },
  },
};
