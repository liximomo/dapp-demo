if (__NETWORK__ === "BSC_MAINNET") {
  module.exports = require("./address.bsc");
} else {
  module.exports = require("./address.bsc-test");
}
