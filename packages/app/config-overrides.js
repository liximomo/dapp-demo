const path = require("path");
const {
  override,
  addBundleVisualizer,
  addWebpackAlias,
  removeModuleScopePlugin,
  addPostcssPlugins
} = require("customize-cra");
const {
  enableBabelConfig,
  autoCssModule,
  addReplacements
} = require("./dev-utils/cra-customizers");
const postcssCustomMedia = require("postcss-custom-media");

const appDir = __dirname;
const rootDir = path.resolve(__dirname, "../..");

process.env.DISABLE_ESLINT_PLUGIN = true;

module.exports = override(
  enableBabelConfig(),

  removeModuleScopePlugin(),

  autoCssModule(),

  addPostcssPlugins([
    postcssCustomMedia({
      importFrom: [
        {
          customMedia: {
            "--viewport-sm": "(min-width: 640px)",
            "--viewport-md": "(min-width: 768px)",
            "--viewport-lg": "(min-width: 1024px)"
          }
        }
      ]
    })
  ]),

  // add webpack bundle visualizer if BUNDLE_VISUALIZE flag is enabled
  process.env.BUNDLE_VISUALIZE === "true" && addBundleVisualizer(),

  // add an alias for "ag-grid-react" imports
  addWebpackAlias({
    "@": path.join(appDir, "src")
  }),

  addReplacements({
    __NETWORK__: JSON.stringify(process.env.NETWORK)
  })

  // config => {
  //   const dest = "customize-cra.log";
  //   const print = [];
  //   print.push(JSON.stringify(config, null, 2));

  //   if (dest) {
  //     const fs = require("fs");
  //     fs.writeFile(dest, `${print.join("\n")}\n`, () => {});
  //   }
  //   return config;
  // }
);
