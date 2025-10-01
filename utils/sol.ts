import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";

export type SolKey = { privateKey: string; publicKey: string };

export function createSolanaKeys(count: number): SolKey[] {
  const out: SolKey[] = [];
  for (let i = 0; i < count; i++) {
    const kp = Keypair.generate();
    out.push({ publicKey: kp.publicKey.toBase58(), privateKey: bs58.encode(kp.secretKey) });
  }
  return out;
}

export async function fetchSolBalances(rpc: string, addresses: string[]): Promise<string[]> {
  const conn = new Connection(rpc, "confirmed");
  const results: string[] = [];
  for (const a of addresses) {
    try {
      const lamports = await conn.getBalance(new PublicKey(a));
      results.push((lamports / LAMPORTS_PER_SOL).toString());
    } catch {
      results.push("N/A");
    }
  }
  return results;
}

