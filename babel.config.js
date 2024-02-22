module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      [
        'module-resolver',
        {
          alias: {
            '@src': './src',
            '@constants': './src/constants.ts',
            '@hooks': './src/hooks',
            '@redux': './src/redux',
            '@utils': './src/utils',
            '@components': './src/components',
            assets: './assets',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.native.tsx', '.web.tsx', '.native.ts', '.web.ts'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
