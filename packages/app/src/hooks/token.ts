import { BigNumberish, BigNumber } from "ethers";
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "@/hooks";
import { getToken } from "@/libs/erc20";
import useWallet, { Wallet } from "./private/useWallet";

function getERC20(tokenAddress: string, wallet: Wallet) {
  return getToken(tokenAddress, wallet.signer);
}

export const useApprove = (tokenAddress: string, spender: string) => {
  const [approved, setApproved] = useState(false);
  const account = useAccount();
  const wallet = useWallet();

  const requestApprove = useCallback(
    async (amount?: BigNumberish) => {
      const erc20 = getERC20(tokenAddress, wallet);
      await erc20.approve(spender, amount);
      setApproved(true);
    },
    [tokenAddress, wallet]
  );

  useEffect(() => {
    async function requestAllowance() {
      try {
        const erc20 = getERC20(tokenAddress, wallet);
        const allowance = await erc20.allowance({ spender });
        setApproved(allowance.gt(0));
      } catch {
        // ignore
      }
    }
    if (account) {
      requestAllowance();
    }
  }, [tokenAddress, wallet, account]);

  return {
    approved,
    requestApprove
  };
};

export function useBalance(tokenAddress: string, deps: any[] = []) {
  const account = useAccount();
  const wallet = useWallet();
  const [balance, setBalance] = useState(BigNumber.from(0));

  useEffect(() => {
    async function requestBalance() {
      const erc20 = getERC20(tokenAddress, wallet);
      const balance = await erc20.balanceOf();
      setBalance(balance);
    }

    if (account) {
      requestBalance();
    }
  }, [tokenAddress, wallet, account, ...deps]);

  return balance;
}
