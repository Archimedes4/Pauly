module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-transform-private-methods',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-private-methods',
      'react-native-reanimated/plugin',
    ],
  };
};
