import { ethers, BigNumber, BigNumberish } from "ethers";
import Big from "big.js";

/*
 *  toFormat v2.0.0
 *  Adds a toFormat instance method to big.js or decimal.js
 *  Copyright (c) 2017 Michael Mclaughlin
 *  MIT Licence
 */

/*
 * Adds a `toFormat` method to `Ctor.prototype` and a `format` object to `Ctor`, where `Ctor` is
 * a big number constructor such as `Decimal` (decimal.js) or `Big` (big.js).
 */

export interface FormatOptions {
  decimalSeparator?: string;
  groupSeparator?: string;
  groupSize?: number;
}

const defaultFormat = {
  decimalSeparator: ".",
  groupSeparator: ",",
  groupSize: 3
};

const intRegCache: { [k: string]: RegExp } = {};

function getIntRegexp(num: number): RegExp {
  let result = intRegCache[num];
  if (!result) {
    result = intRegCache[num] = new RegExp(`\\d(?=(\\d{${num || 3}})+$')`, "g");
  }

  return result;
}

export function getApy(apr: number) {
  return Math.pow(1 + apr / 365, 365) - 1;
}

export function formatPercentage(
  number: number,
  percision: number = 2
): string {
  if (number === 0) {
    return "-";
  }
  const num = number * 100;
  if (num / 1e6 >= 1) {
    const r = Math.floor((num / 1e6) * 100) / 100;
    return `${r}M%`;
  } else if (num / 1e3 >= 1) {
    const r = Math.floor((num / 1e3) * 100) / 100;
    return `${r}K%`;
  }

  return `${(Math.floor(num * 100) / 100).toFixed(percision)}%`;
}

export function formatNumber(
  number: number | string,
  format: FormatOptions = {}
) {
  const fmt = {
    ...defaultFormat,
    ...format
  };
  const num = "" + number;

  let [intPart, fracPart = ""] = num.split(".");

  if (fracPart.length) {
    const intReg = getIntRegexp(fmt.groupSize);
    intPart = intPart.replace(intReg, `$&${fmt.groupSeparator}`);
    return intPart + fmt.decimalSeparator + fracPart;
  } else {
    return intPart;
  }
}

export function formatUnits(
  number: BigNumberish,
  units: number = 18,
  decimalPlaces: number = 2
) {
  const num = new Big(BigNumber.from(number).toString());
  return num.div(new Big(10).pow(units)).toFixed(decimalPlaces, Big.roundDown);
}

export function parseUnits(value: string, units: number = 18) {
  return ethers.utils.parseUnits(value, units);
}
