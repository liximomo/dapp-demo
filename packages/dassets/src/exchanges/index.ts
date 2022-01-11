import { IFlip, IExchange } from "./types";
import { getConfig } from "../config";
import { GetterOverridesOptions } from "../types";

const DEFAULT_DECIMALS = 18;

export type { IFlip, IExchange };

let FlipInfo: {
  [index: string]: IFlip;
} = {};

export function getExchange(
  exchange: string,
  options: GetterOverridesOptions = {}
): IExchange {
  const exchangeConfig = getConfig<IExchange>(exchange, options.config);
  if (!exchangeConfig) {
    throw new Error(`Exchange not Found. (${exchange})`);
  }

  return exchangeConfig;
}

const FLIP_NAME_REGEX = /^([0-9a-zA-Z]+)[-_]([0-9a-zA-Z]+)/;
export function getFlip(
  exchange: string,
  id: string,
  options: GetterOverridesOptions = {}
): IFlip {
  const match = id.match(FLIP_NAME_REGEX);
  if (!match) {
    throw new Error(`id is invalid. (${id})`);
  }

  const suffix = id.replace(match[0], "");
  const [token0, token1] = match[0].split("-");
  id = `${token0}-${token1}${suffix}`;
  const reversedId = `${token1}-${token0}${suffix}`;
  const key = `${exchange}@${[token0, token1].sort().join("_")}`;
  if (FlipInfo[key]) {
    return FlipInfo[key];
  }

  const exchangeConfig = getConfig<IExchange>(exchange, options.config);
  if (!exchangeConfig) {
    throw new Error(`Exchange not Found. (${exchange})`);
  }

  const flipConfig = exchangeConfig.LpTokens.find(
    lp => lp.name === id || lp.name === reversedId
  );
  if (!flipConfig) {
    throw new Error(`Flip not Found. (${id})`);
  }

  const flip = (FlipInfo[key] = {
    ...flipConfig,
    symbol: flipConfig.symbol || flipConfig.name,
    decimals: DEFAULT_DECIMALS
  });

  return flip;
}
