// Based on https://github.com/umijs/umi/blob/83301f25a420daff69ca51a179134c6b1612f5b6/packages/babel-plugin-auto-css-modules/src/index.ts
// License: https://github.com/umijs/umi/blob/83301f25a420daff69ca51a179134c6b1612f5b6/LICENSE

const { extname } = require("path");

const CSS_EXTNAMES = [".css", ".sass", ".scss"];

module.exports = function() {
  return {
    visitor: {
      ImportDeclaration(path, { opts }) {
        const {
          specifiers,
          source,
          source: { value }
        } = path.node;
        if (!CSS_EXTNAMES.includes(extname(value))) {
          return;
        }
        const isCssMoudle = specifiers.length > 0;
        if (value.indexOf("?") >= 0) {
          source.value = `${value}&${opts.flag || "cssmodules"}=${isCssMoudle}`;
        } else {
          source.value = `${value}?${opts.flag || "cssmodules"}=${isCssMoudle}`;
        }
      }
    }
  };
};
