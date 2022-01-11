import { Wallet } from "../../services/wallet";
import { useContext } from "react";
import { WalletContext } from "@/context/WalletContext";

export type { Wallet };

export default function useWallet() {
  const { wallet } = useContext(WalletContext);

  return wallet;
}
