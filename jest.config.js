// jest.config.js
// Sync object
module.exports = {
  testEnvironment: 'jsdom',
  preset: 'jest-expo',
  transform: {
    '^.+\\.jsx$': 'babel-jest',
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@react-native|react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|sentry-expo|native-base)',
  ],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  moduleNameMapper: {
    '^@src/(.*)': '<rootDir>/src/$1',
    '^@constants': '<rootDir>/src/constants.ts',
    '^@hooks/(.*)': '<rootDir>/src/hooks/$1',
    '^@redux/(.*)': '<rootDir>/src/redux/$1',
    '^@utils/(.*)': '<rootDir>/src/utils/$1',
    '^@components/(.*)': '<rootDir>/src/components/$1',
    '^assets/(.*)': '<rootDir>/assets/$1',
  },
};
