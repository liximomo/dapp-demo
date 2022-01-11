import {
  Contract,
  Signer,
  providers,
  ethers,
  BigNumberish,
  BigNumber
} from "ethers";
import ERC20 from "./ERC20.json";

interface AllowanceOptions {
  spender: string;
  owner?: string;
}

interface TokenWrapper {
  allowance(spender: AllowanceOptions): Promise<BigNumber>;
  approve(address: string, number?: BigNumberish): Promise<void>;
  balanceOf(address?: string): Promise<BigNumber>;
}

export function getTokenContract(
  address: string,
  provider: providers.Provider | Signer
): Contract {
  return new Contract(address, ERC20, provider);
}

export function getToken(
  address: string,
  provider: providers.Provider | Signer
): TokenWrapper {
  const contract = new Contract(address, ERC20, provider);

  const tokenWrapper: TokenWrapper = {
    async allowance({ spender, owner }: AllowanceOptions) {
      if (!owner) {
        owner = await contract.signer.getAddress();
      }
      return contract.allowance(owner, spender);
    },
    async approve(
      address: string,
      number: BigNumberish = ethers.constants.MaxUint256
    ) {
      const tx = await contract.approve(address, number);
      await tx.wait();
    },
    async balanceOf(address?: string) {
      if (!address) {
        address = await contract.signer.getAddress();
      }
      return contract.balanceOf(address);
    }
  };

  return tokenWrapper;
}
