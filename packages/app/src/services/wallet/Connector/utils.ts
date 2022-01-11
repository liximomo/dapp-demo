import { SignerWithProvider } from "./ConnectorTypes";
import { ethers, VoidSigner } from "ethers";

export function getVoidSinger(httpRpc: string): SignerWithProvider {
  return new VoidSigner(
    "",
    new ethers.providers.JsonRpcProvider(httpRpc)
  ) as SignerWithProvider;
}
