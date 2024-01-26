module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      '@babel/plugin-proposal-export-namespace-from',
      'react-native-reanimated/plugin',
      ["module-resolver", {
        "alias": {
          "@src": "./src",
          "@constants": "./src/constants.ts",
          "@hooks": "./src/hooks",
          "@redux": "./src/redux",
          "@utils": "./src/utils",
          "@components": "./src/components",
          "assets": "./assets",
        },
        "extensions": [
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
        ]
      }],
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
