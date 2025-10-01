import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

export type SuiKey = { privateKey: string; publicKey: string };

export function createSuiKeys(count: number): SuiKey[] {
  const out: SuiKey[] = [];
  for (let i = 0; i < count; i++) {
    const kp = Ed25519Keypair.generate();
    const address = kp.getPublicKey().toSuiAddress();
    const exported = kp.export();
    out.push({ publicKey: address, privateKey: exported.privateKey });
  }
  return out;
}

export function formatSuiFromMist(mist: string): string {
  const n = Number(mist) / 1e9;
  if (!isFinite(n)) return "N/A";
  return n.toLocaleString(undefined, { maximumFractionDigits: 9 });
}

export async function fetchSuiBalances(rpc: string, owners: string[]): Promise<string[]> {
  const client = new SuiClient({ url: rpc });
  const results: string[] = [];
  for (const owner of owners) {
    try {
      const bal = await client.getBalance({ owner });
      results.push(formatSuiFromMist(bal.totalBalance));
    } catch {
      results.push("N/A");
    }
  }
  return results;
}

