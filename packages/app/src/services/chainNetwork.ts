interface Network {
  chainId: number;
  httpRpc: string;
}

const networks: { [name: string]: Network } = {
  BSC_MAINNET: {
    chainId: 56,
    httpRpc: "https://bsc-dataseed.binance.org"
  },
  BSC_TESTNET: {
    chainId: 97,
    httpRpc: "https://data-seed-prebsc-1-s1.binance.org:8545/"
  }
};

export function getNetwork() {
  const network = networks[__NETWORK__ || 'BSC_TESTNET'];

  if (!network) {
    throw new Error(`Network "${__NETWORK__}" not found`);
  }

  return network;
}
