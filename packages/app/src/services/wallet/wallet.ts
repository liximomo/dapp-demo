import { ethers, BigNumber } from "ethers";
import EventEmitter, { UnlistenFn } from "@/libs/eventEmitter";
import {
  Connector,
  InjectedConnector,
  SignerWithProvider,
  ReadonlyConnector,
  WalletConnectConnector
} from "./Connector";
import { getNetwork as getDefaultNetwork } from "../chainNetwork";

const DEFAULT_NETWORK = getDefaultNetwork();

export enum ConnectorType {
  MetaMask = "injected-ethereum",
  TrustWallet = "injected-ethereum",
  TokenPocket = "injected-ethereum",
  WalletConnect = "wallet-connect"
}

export interface Network {
  chainId: number;
}

export interface Wallet {
  readonly account: string | null;
  readonly signer: ethers.Signer;
  connect(): Promise<void>;
  connectTo(type: ConnectorType): Promise<void>;
  disconnect(): Promise<void>;
  getNetwork(): Network;
  getBalance(): Promise<BigNumber>;
  getBlockBumber(): number;
  onBlock(cb: (blocknum: number) => void): UnlistenFn;
  onChainChanged(cb: (chainId: number) => void): UnlistenFn;
  onAccountChanged(cb: (address: string) => void): UnlistenFn;
  onDisconnect(cb: (err: any) => void): UnlistenFn;
}

const walletEvent = EventEmitter();

let inited = false;
let _connector: Connector;
let _signer: SignerWithProvider;
let account: string | null = null;
let currentBlockNumber: number = 0;
let network: Network;

const wrappedWallet: Wallet = {
  get signer() {
    return _signer;
  },
  get account() {
    return account;
  },
  async getBalance() {
    return _signer.getBalance();
  },
  getBlockBumber() {
    return currentBlockNumber;
  },
  getNetwork() {
    return network;
  },
  async connect() {
    if (!_connector) {
      return;
    }

    _signer = await _connector.connect();
  },
  async disconnect() {
    if (!_connector) {
      return;
    }

    await _connector.disconnect();
    handleAccountsChanged([]);
    hanldeDisconnect(null);
    const connector = new ReadonlyConnector(DEFAULT_NETWORK);
    _signer = await connector.getSigner();
    await setupConnector(connector);
  },
  async connectTo(type: ConnectorType) {
    const connector = getConnector(type);
    if (!connector) {
      return;
    }

    _signer = await connector.connect();
    await setupConnector(connector);
  },
  onBlock(cb: (blocknum: number) => void) {
    return walletEvent.on("block", cb);
  },
  onDisconnect(cb: (err: any) => void) {
    return walletEvent.on("disconnect", cb);
  },
  onChainChanged(cb: (chainId: number) => void) {
    return walletEvent.on("chainChanged", cb);
  },
  onAccountChanged(cb: (account: string) => void) {
    return walletEvent.on("accountChanged", cb);
  }
};

function getConnector(type?: ConnectorType | null): Connector | null {
  let connector: Connector | null = null;
  if (type === ConnectorType.MetaMask) {
    connector = new InjectedConnector("ethereum", DEFAULT_NETWORK.chainId);
  } else if (type === ConnectorType.WalletConnect) {
    connector = new WalletConnectConnector(DEFAULT_NETWORK);
  }

  return connector;
}

function handleAccountsChanged(accounts: string[]) {
  const address = typeof accounts[0] !== "undefined" ? accounts[0] : null;
  if (account !== address) {
    account = address;
    walletEvent.emit("accountChanged", account);
  }
}

function hanldeDisconnect(error: any) {
  walletEvent.emit("disconnect", error);
}

function handleChainChanged(chainId: any) {
  if (typeof chainId === "string") {
    chainId = parseInt(chainId, 16);
  }

  if (chainId !== network?.chainId) {
    if (_connector) {
      _signer = _connector?.getSigner();
    }
    network = {
      chainId
    };
    walletEvent.emit("chainChanged", chainId);
  }
}

function handleBlockChanged(blockNumber: number) {
  if (blockNumber !== currentBlockNumber) {
    currentBlockNumber = blockNumber;
    walletEvent.emit("block", blockNumber);
  }
}

async function getAddress(signer: ethers.Signer): Promise<string | null> {
  let address;
  try {
    address = await signer.getAddress();
    // void signer will return ''
    if (!address) {
      address = null;
    }
  } catch (error) {
    address = null;
  }
  return address;
}

async function getBlockBumber(
  provider: ethers.providers.Provider
): Promise<number> {
  let res;
  try {
    res = await provider.getBlockNumber();
  } catch (error) {
    res = 0;
  }
  return res;
}

async function getNetwork(
  provider: ethers.providers.Provider
): Promise<Network> {
  let res;
  try {
    res = await provider.getNetwork();
  } catch (error) {
    res = getDefaultNetwork();
  }
  return {
    chainId: res.chainId
  };
}

async function setupConnector(connector: Connector) {
  if (_connector) {
    clearConnector();
  }

  const provider = _signer.provider;
  const [blockNumber, _network, _account] = await Promise.all([
    getBlockBumber(provider),
    getNetwork(provider),
    getAddress(_signer)
  ]);
  handleBlockChanged(blockNumber);
  handleAccountsChanged(_account !== null ? [_account] : []);
  handleChainChanged(_network.chainId);

  connector.on("accountsChanged", handleAccountsChanged);
  connector.on("disconnect", hanldeDisconnect);
  connector.on("chainChanged", handleChainChanged);
  _signer.provider.on("block", handleBlockChanged);
  _connector = connector;
}

function clearConnector() {
  _connector.off("accountsChanged", handleAccountsChanged);
  _connector.off("disconnect", hanldeDisconnect);
  _connector.off("chainChanged", handleChainChanged);
  _signer.provider.off("block", handleBlockChanged);
}

export async function initWallet(type?: string | null) {
  if (inited) {
    return;
  }

  const connector =
    getConnector(type as ConnectorType) ||
    new ReadonlyConnector(DEFAULT_NETWORK);
  _signer = await connector.getSigner();
  await setupConnector(connector);

  inited = true;
}

export function getWallet(): Wallet {
  if (!inited) {
    throw new Error("please call initWallet first");
  }

  return wrappedWallet!;
}
