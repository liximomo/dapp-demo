import { IToken } from "./types";
import { getConfig } from "../config";
import { GetterOverridesOptions } from "../types";

const DEFAULT_DECIMALS = 18;

export type { IToken };

let TokenInfo: {
  [index: string]: IToken;
} = {};

export function getToken(
  id: string,
  options: GetterOverridesOptions = {}
): IToken {
  if (TokenInfo[id]) {
    return TokenInfo[id];
  }

  const tokens = getConfig("tokens", options.config);
  const config = tokens[id];
  if (!config) {
    throw new Error(`Token not Found. (${id})`);
  }

  const token = (TokenInfo[id] = {
    ...config,
    symbol: config.symbol || config.name,
    decimals: config.decimals || DEFAULT_DECIMALS
  });

  return token;
}
