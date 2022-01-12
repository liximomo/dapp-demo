import { ethers } from "ethers";
import { personalSign } from "@metamask/eth-sig-util";
import {
  addHexPrefix,
  privateToAddress as _privateToAddress
} from "ethereumjs-util";

function formMessage(address: string) {
  const message = ethers.utils.solidityKeccak256(["address"], [address]);
  return message;
}

export function privateToAddress(privateKey: Buffer) {
  return ethers.utils.getAddress(
    addHexPrefix(_privateToAddress(privateKey).toString("hex"))
  );
}

export function getSignature(privateKey: string | Buffer, address: string) {
  const privateKeyBuffer =
    typeof privateKey === "string"
      ? Buffer.from(privateKey, "hex")
      : privateKey;
  const msg = formMessage(address);
  const signature = personalSign({ privateKey: privateKeyBuffer, data: msg });
  return signature;
}

// getSignature(
//   "399c90e2314a0444133693262eb00b2c2e2b42d66a462e447bcc53b5015ef7ce",
//   "0xc13018A528e4498ee6Fa28D0F519a034972ad1e8"
// );
