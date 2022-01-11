import { createContext } from "react";
import { Wallet } from "@/services/wallet";

interface WalletContextValue {
  wallet: Wallet;
}

export const WalletContext = createContext<WalletContextValue>(null as any);
