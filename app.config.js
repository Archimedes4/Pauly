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
      bundleIdentifier: 'com.Archimedes4.Pauly',
      buildNumber: '84',
      associatedDomains: ["applinks:paulysphs.ca"],
      infoPlist: {
        "ITSAppUsesNonExemptEncryption": false
      }
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
        build: {
          "experimental": {
            "ios": {
              "appExtensions": [
                {
                  "targetName": "Pauly_Widget",
                  "bundleIdentifier": "com.Archimedes4.Pauly.Pauly-Widget",
                  "entitlements": {
                    "com.apple.keychain-access-groups":[
                      "$(AppIdentifierPrefix)Archimedes4.Pauly",
                      "$(AppIdentifierPrefix)com.microsoft.adalcache"
                    ]
                  }
                }
              ]
            }
          }
        }
      }
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
      [
        '@archimedes4/expo-msal',
        {
          "androidPackageSignatureHash": ""
        }
      ],
      [
        '@bacons/apple-targets',
        {
          "teamId": "SYV2CK2N9N"
        }
      ]
    ],
    experiments: {
      tsconfigPaths: true,
    },
  },
};
