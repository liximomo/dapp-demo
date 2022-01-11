import path from "path";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-typechain";
import "./libs/hardhat-plugin";
import { loadTasks } from "./libs/loadTasks";
import { getPrivateKeys } from "./libs/dotSecret";

loadTasks(path.join(__dirname, "tasks"));

const privates = getPrivateKeys();

const accountName = "Dev";
const accounts = privates[accountName] ? [privates[accountName]] : [];

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  paths: {
    sources: "./src"
  },
  networks: {
    hardhat: {},
    bscMainnet: {
      chainId: 56,
      url: "https://bsc-dataseed1.binance.org/",
      accounts
    },
    bscTestnet: {
      chainId: 97,
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5"
  }
};

export default config;
