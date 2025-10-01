import { ethers } from "ethers";

export type EthKey = { privateKey: string; publicKey: string };

export function createRandomEthKeys(count: number, rpc?: string): EthKey[] {
  const keys: EthKey[] = [];
  for (let i = 0; i < count; i++) {
    const hd = ethers.HDNodeWallet.createRandom();
    const wallet = rpc ? new ethers.Wallet(hd.privateKey, new ethers.JsonRpcProvider(rpc)) : new ethers.Wallet(hd.privateKey);
    keys.push({ privateKey: wallet.privateKey, publicKey: wallet.address });
  }
  return keys;
}

export async function fetchEthBalances(rpc: string, addresses: string[]): Promise<string[]> {
  const provider = new ethers.JsonRpcProvider(rpc);
  const results: string[] = [];
  for (const addr of addresses) {
    try {
      const bal = await provider.getBalance(addr);
      results.push(ethers.formatEther(bal));
    } catch {
      results.push("N/A");
    }
  }
  return results;
}

