const webpack = require("webpack");

module.exports = values => config => {
  config.plugins.push(
    new webpack.DefinePlugin({
      ...values
    })
  );
  return config;
};
