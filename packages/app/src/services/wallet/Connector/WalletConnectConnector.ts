import { Connector, SignerWithProvider } from "./ConnectorTypes";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { getVoidSinger } from "./utils";

interface WalletConnectConnectorOptions {
  chainId: number;
  httpRpc: string;
}

export default class WalletConnectConnector implements Connector {
  chainId: number;
  private _walletConnectProvider: WalletConnectProvider;
  private _signer: SignerWithProvider;

  constructor({ chainId, httpRpc }: WalletConnectConnectorOptions) {
    this.chainId = chainId;
    this._walletConnectProvider = new WalletConnectProvider({
      chainId,
      rpc: {
        [chainId]: httpRpc
      },
      qrcode: true
    });
    this._signer = getVoidSinger(httpRpc);
  }

  getSigner() {
    return this._signer;
  }

  async connect() {
    await this._walletConnectProvider.enable();

    const provider = new ethers.providers.Web3Provider(
      this._walletConnectProvider
    );

    this._signer = provider.getSigner();
    return this._signer;
  }

  async disconnect() {
    await this._walletConnectProvider.disconnect();
  }

  on(event: string, cb: any): void {
    this._walletConnectProvider.on(event, cb);
  }

  off(event: string, cb: any): void {
    this._walletConnectProvider.removeListener(event, cb);
  }
}
