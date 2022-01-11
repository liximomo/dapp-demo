import style from "./index.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ConnectorType } from "@/services/wallet";
import { ContractFactory } from "@/services/contracts";
import { useAccount, useWalletConnect } from "@/hooks";

export default function () {
  const [balance, setBalance] = useState(ethers.BigNumber.from(0));
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(0);
  const account = useAccount();
  const { connected, requestConnectTo } = useWalletConnect();

  useEffect(() => {
    const getBalance = async (user: string) => {
      const token = ContractFactory.getOrangeToken();
      const balance = await token.balanceOf(user);

      setBalance(balance);
    };

    if (account) {
      getBalance(account);
    }
  }, [account]);

  return (
    <div>
      <div className={style.Block}>
        {connected ? (
          <div>{account}</div>
        ) : (
          <button onClick={() => requestConnectTo(ConnectorType.MetaMask)}>
            connect
          </button>
        )}
      </div>

      <div className={style.Block}>
        <div>Wallet Balance:</div>
        <div>{ethers.utils.formatEther(balance)}</div>
      </div>

      <div className={style.Block}>
        <div>Transfer</div>
        <div>to</div>
        <div>
          <input value={to} onChange={event => setTo(event.target.value)} />
        </div>
        <div>amount:</div>
        <div>
          <input
            value={amount}
            onChange={event => setAmount(+event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
