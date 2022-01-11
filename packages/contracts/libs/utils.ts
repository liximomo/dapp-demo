import {
  ethers,
  Signer,
  BigNumberish,
  ContractTransaction,
  BigNumber
} from "ethers";

export function parseEther(num: string): BigNumber {
  return ethers.utils.parseEther(num);
}

export async function waitTx(
  tx: ContractTransaction | Promise<ContractTransaction>,
  ...txs: ContractTransaction[]
) {
  txs = [await tx, ...txs];

  const res = [];
  for (let index = 0; index < txs.length; index++) {
    const tx = txs[index];
    res.push(await tx.wait());
  }

  return res;
}

export async function sendEth(signer: Signer, to: string, value: BigNumberish) {
  const tx = await signer.sendTransaction({
    to,
    value: ethers.BigNumber.from(value)
  });
  const receipt = await tx.wait();

  if (receipt.status !== 1) {
    throw new Error(`Error: ${receipt.status}`);
  }
}

export function getBlockFromTime(
  time: string | Date,
  latestBlock: number,
  latestBlockTime: string | Date,
  secondsPerBlock: number
) {
  time = typeof time === "string" ? new Date(time) : time;
  latestBlockTime =
    typeof latestBlockTime === "string"
      ? new Date(latestBlockTime)
      : latestBlockTime;
  const seconds = Math.ceil(
    (time.getTime() - latestBlockTime.getTime()) / 1000
  );

  return latestBlock + Math.floor(seconds / secondsPerBlock);
}
