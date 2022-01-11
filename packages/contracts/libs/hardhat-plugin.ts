import { extendEnvironment } from "hardhat/config";

extendEnvironment(hre => {
  if (hre.network.name === "bscMainnet") {
    require("@dapp/dassets/config.bsc");
  } else if (hre.network.name === "bscTestnet") {
    require("@dapp/dassets/config.bsc-test");
  }
});
