// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
var config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {}

module.exports = config;
