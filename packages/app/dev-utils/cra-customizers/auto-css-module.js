const { adjustStyleLoaders } = require("customize-cra");

const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;
const cssModuleQueryRegex = /cssmodules=true/;
const noneCssModuleQueryRegex = /cssmodules=false/;

module.exports = () => config => {
  adjustStyleLoaders(loader => {
    if (loader.test.test("a.css")) {
      loader.resourceQuery = noneCssModuleQueryRegex;
    } else if (loader.test.test("a.scss")) {
      loader.resourceQuery = noneCssModuleQueryRegex;
    } else if (loader.test.test("a.module.css")) {
      loader.test = cssRegex;
      loader.resourceQuery = cssModuleQueryRegex;
    } else if (loader.test.test("a.module.scss")) {
      loader.test = sassRegex;
      loader.resourceQuery = cssModuleQueryRegex;
    }
  })(config);

  return config;
};
