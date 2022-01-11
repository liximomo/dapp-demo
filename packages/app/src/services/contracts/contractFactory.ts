import { Contract } from "ethers";
import { OrangeToken } from "@dapp/contracts/types";
import { getAbi } from "./abis";
import Address from "./address";
import { getWallet } from "../wallet";

// name or name paths
// a or a.b or a.b.c[1]
function getAddress(name: string): string {
  const segments = name.split(".");
  // @ts-ignore
  let cur = Address[segments[0]];
  for (let i = 1; i < segments.length && cur; i++) {
    // @ts-ignore
    cur = cur[segments[i]];
  }

  if (!cur) {
    throw new Error(`Address not Found. (${name})`);
  }

  return cur;
}

const ContractFactory = {
  getOrangeToken
};

function getOrangeToken(): OrangeToken {
  const wallet = getWallet();
  return new Contract(
    getAddress("OrangeToken"),
    getAbi("OrangeToken"),
    wallet.signer
  ) as any;
}

export { getAddress, ContractFactory };
