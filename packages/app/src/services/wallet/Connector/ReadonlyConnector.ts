import { SignerWithProvider, Connector } from "./ConnectorTypes";
import { ethers, VoidSigner } from "ethers";
import { getVoidSinger } from "./utils";

export interface Network {
  chainId: number;
  httpRpc: string;
}

export default class ReadonlyConnector implements Connector {
  chainId: number;
  private _network: Network;

  constructor(network: Network) {
    this.chainId = network.chainId;
    this._network = network;
  }

  getSigner() {
    return getVoidSinger(this._network.httpRpc);
  }

  async connect() {
    if (this.chainId !== this._network.chainId) {
      throw new Error("Wrong Network");
    }

    return getVoidSinger(this._network.httpRpc);
  }

  async disconnect() {
    // do nothing
  }

  on(_event: string, _cb: any): void {
    // do nothing
  }
  off(_event: string, _cb: any): void {
    // do nothing
  }
}
