import BatchCall, { IBatchCall, CallWithContract } from "@/libs/batchcall";
import { getNetwork } from "@/services/chainNetwork";
import { getWallet } from "@/services/wallet";

export type StructureCall = Record<string, CallWithContract>;

const batchcall: IBatchCall["call"] = (...args: any[]) => {
  const network = getNetwork();
  const wallet = getWallet();
  const inst = BatchCall(network.chainId, wallet.signer);
  // @ts-ignore
  return inst.call.apply(inst, args);
};

const batchcallStructure = async (
  ...args: Array<StructureCall>
): Promise<Array<Record<string, any>>> => {
  const records: any[] = [];
  const calls: CallWithContract[] = [];
  let recordIndex = 0;
  for (let index = 0; index < args.length; index++) {
    const item = args[index];
    const keys = Object.keys(item);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const key = keys[keyIndex];
      calls.push(item[key]);
      records[recordIndex++] = [index, key];
    }
  }

  const results = await batchcall.apply(null, calls as any);
  const objs: Record<string, any>[] = [];
  for (let index = 0; index < results.length; index++) {
    const [objIndex, objKey] = records[index];
    const obj = objs[objIndex] || (objs[objIndex] = {});
    obj[objKey] = results[index];
  }

  return objs;
};

export type { CallWithContract };
export { batchcallStructure };

export default batchcall;
