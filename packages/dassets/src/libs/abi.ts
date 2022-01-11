const abis = new Map<string, any>();

export function registerAbi(id: string, abi: any): void {
  if (abis.has(id)) {
    console.warn(`ABI "${id}" existed`);
    return;
  }

  abis.set(id, abi);
}

export function resolveAbi(id: string): any {
  return abis.get(id);
}

export function getAbi(id: string) {
  const abi = resolveAbi(id);
  if (!abi) {
    throw new Error(`ABI Not Found. (${id})`);
  }
  return abi;
}
