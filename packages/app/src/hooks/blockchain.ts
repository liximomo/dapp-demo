import { useEffect, useState, useRef } from "react";
import useWallet from "./private/useWallet";

const SECONDS_PER_BLOCK = 3;

const secondsToBlock = (seconds: number) => {
  return Math.ceil(seconds / SECONDS_PER_BLOCK);
};

const _useBlock = (minTnterval: number = 1) => {
  const wallet = useWallet();
  const blockNum = useRef(0);
  const [block, setBlock] = useState(wallet.getBlockBumber());

  useEffect(() => {
    blockNum.current = 0;

    const unlisten = wallet.onBlock(block => {
      blockNum.current += 1;
      if (blockNum.current >= minTnterval) {
        blockNum.current = 0;
        setBlock(block);
      }
    });

    return unlisten;
  }, [wallet]);

  return block;
};

export const useBlock = () => {
  return _useBlock(secondsToBlock(30));
};

export const useFastBlock = () => {
  return _useBlock(secondsToBlock(10));
};

export const useSlowBlock = () => {
  return _useBlock(secondsToBlock(120));
};
