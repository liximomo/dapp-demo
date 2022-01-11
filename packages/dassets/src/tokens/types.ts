export interface TokenAddressBook {
  [index: string]: {
    name: string;
    address: string;
    symbol?: string;
    decimals?: number;
  };
}

export interface IToken {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
}
