const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  // Custom resolution for ESM-only packages
  resolveRequest: (context, moduleName, platform) => {
    // Handle make-plural ESM module for i18n-js
    if (moduleName === 'make-plural') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/make-plural/plurals.js'),
        type: 'sourceFile',
      };
    }
    // Fall back to default resolution
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;