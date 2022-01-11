const { getBabelLoader } = require("customize-cra");

const enableBabelConfig = () => config => {
  const babelLoader = getBabelLoader(config);
  babelLoader.options.babelrc = true;

  delete babelLoader.options.presets;
  delete babelLoader.options.cacheIdentifier;

  const noneAppBabelLoader = getBabelLoader(config, true);
  delete noneAppBabelLoader.options.cacheIdentifier;

  return config;
};

module.exports = enableBabelConfig;
