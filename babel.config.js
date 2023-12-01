process.env.EXPO_ROUTER_APP_ROOT = "../../src/app";
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      [
        'module-resolver',
        {
          alias: {
            "@src/*":"src/*",
            "@hooks/*": "src/hooks/*",
            "@Redux/*": "src/Redux/*",
            "@Functions/*": "src/Functions/*",
            "@components/*": "src/components/*",
            'assets': './assets',
          },
          "extensions": [
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
          ]
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
