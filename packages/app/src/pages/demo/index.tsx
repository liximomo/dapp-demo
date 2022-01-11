import style from "./index.css";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import abi from "./OrangeToken.json";

function getSigner() {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  return provider.getSigner();
}

function getContract(provier: ethers.providers.Provider | ethers.Signer) {
  return new ethers.Contract(
    "0x2B137348dc301702C6c966A0ef1A4a2B2f74d3d2",
    abi,
    provier
  );
}

export default function () {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(ethers.BigNumber.from(0));
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("0");

  const transform = useCallback(async to => {
    const token = getContract(getSigner());
    const tx = await token.transfer(to, ethers.utils.parseEther(amount));
    await tx.wait();

    alert("transfer success");
  }, [amount]);

  useEffect(() => {
    const fn = async () => {
      const signer = getSigner();
      const address = await signer.getAddress();
      const token = getContract(signer);
      const balance = await token.balanceOf(address);

      setAddress(address);
      setBalance(balance);
    };

    fn();
  }, []);

  return (
    <div>
      <div className={style.Block}>
        <div>Wallet Address:</div>
        <div>{address}</div>
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
            onChange={event => setAmount(event.target.value)}
          />
        </div>
        <button onClick={() => transform(to)}>Transfer Token</button>
      </div>
    </div>
  );
}
