import { Signer as EthersSigner, providers } from "ethers";

export type AccountChangedHandler = (accounts: string[]) => void;
export type DisconnectHandler = (error: any) => void;
export type ChainChangedHandler = (chainId: number) => void;

export type SignerWithProvider = EthersSigner & {
  provider: providers.Provider;
};

export type Event = "accountsChanged" | "disconnect" | "chainChanged";

export interface Connector {
  chainId: number;

  getSigner(): SignerWithProvider;
  connect(): Promise<SignerWithProvider>;
  disconnect(): Promise<void>;

  on(event: "accountsChanged", handler: AccountChangedHandler): void;
  on(event: "disconnect", handler: DisconnectHandler): void;
  on(event: "chainChanged", handler: ChainChangedHandler): void;
  on(event: Event, handler: any): void;

  off(event: Event, handler: any): void;
}
