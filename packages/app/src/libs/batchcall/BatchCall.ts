import { Contract, Signer, providers } from "ethers";
import Address from "./address";
import MultiCallAbi from "./MultiCall.json";

export interface CallWithContract {
  contract: Contract;
  method: string;
  args?: any[];
}

export interface Call {
  method: string;
  args?: any[];
}

export interface IBatchCall {
  call(...calls: CallWithContract[]): Promise<any[]>;
  call(contract: Contract, ...calls: Call[]): Promise<any[]>;
}

class BatchCallImpl implements IBatchCall {
  private _contract: Contract;

  constructor(chainId: number, provider: providers.Provider | Signer) {
    const address = Address[chainId];
    if (!address) {
      throw new Error(`Invalid ChainId. (${chainId})`);
    }
    this._contract = new Contract(address, MultiCallAbi, provider);
  }

  call(...calls: CallWithContract[]): Promise<any[]>;
  call(contract: Contract, ...calls: Call[]): Promise<any[]>;
  call(...args: any[]): any {
    const [first, ...rest] = args;
    if (first instanceof Contract) {
      return this._call(rest.map(c => ({ ...c, contract: first })));
    }

    return this._call(args);
  }

  async _call(calls: CallWithContract[]): Promise<any[]> {
    const input = calls.map(({ contract, method, args }) => {
      return [
        contract.address,
        contract.interface.encodeFunctionData(method, args)
      ];
    });

    const { returnData } = await this._contract.aggregate(input);
    const res = calls.map((_, index) => {
      const { contract, method } = calls[index];
      const raw = contract.interface.decodeFunctionResult(
        method,
        returnData[index]
      );
      if (raw.length === 1) {
        return raw[0];
      }

      return raw;
    });

    return res;
  }
}

export function BatchCall(
  chainId: number,
  provider: providers.Provider | Signer
): IBatchCall {
  return new BatchCallImpl(chainId, provider);
}
