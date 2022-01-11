import { Connector } from "./ConnectorTypes";
import { ethers } from "ethers";

export default class InjectedConnector implements Connector {
  chainId: number;
  private _ethereum: any;

  constructor(name: string, chainId: number) {
    this.chainId = chainId;
    this._ethereum = (window as any)[name];
  }

  getSigner() {
    const ethereum = this._ethereum;
    const provider = new ethers.providers.Web3Provider(ethereum);
    return provider.getSigner();
  }

  async connect() {
    const ethereum = this._ethereum;
    const chainId = this.chainId;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const newtork = await provider.getNetwork();

    if (chainId !== newtork.chainId) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: `0x${chainId.toString(16)}`
            }
          ]
        });
      } catch (error) {
        if (error.code === 4902) {
          // the chain has not beed added to wallet
          console.log(`Unknown Network. (${chainId})`);
        } else {
          console.error(error);
        }
        throw error;
      }
    }

    try {
      await ethereum.request({
        method: "eth_requestAccounts"
      });
    } catch (error) {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log("user rejected connect to MetaMask.");
      } else {
        console.error(error);
      }
      throw error;
    }

    return provider.getSigner();
  }

  async disconnect() {}

  on(event: string, cb: any): void {
    this._ethereum.on(event, cb);
  }

  off(event: string, cb: any): void {
    this._ethereum.removeListener(event, cb);
  }
}
