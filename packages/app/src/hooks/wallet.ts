import { useState, useEffect, useReducer } from "react";
import { Network, Wallet, ConnectorType } from "@/services/wallet";
import useWallet from "./private/useWallet";

export type { Wallet };

export function useNetwork(): Network {
  const wallet = useWallet();
  const [_, forceUpdate] = useReducer(a => a * -1, 1);

  useEffect(() => {
    const unlinsten = wallet.onChainChanged(() => forceUpdate());
    return unlinsten;
  }, [wallet]);

  return wallet.getNetwork();
}

export function useAccount(): string | null {
  const wallet = useWallet();
  const [accout, setAccount] = useState<string | null>(wallet.account);
  useEffect(() => {
    const unlinsten = wallet.onAccountChanged(newAccount =>
      setAccount(newAccount)
    );
    return unlinsten;
  }, [wallet]);

  return accout;
}

export function useWalletConnect() {
  const wallet = useWallet();
  const account = useAccount();

  return {
    connected: !!account,
    requestConnect: () => wallet.connect(),
    requestConnectTo: (type: ConnectorType) => wallet.connectTo(type),
    disconnect: () => wallet.disconnect()
  };
}
