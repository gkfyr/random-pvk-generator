import { randomBytes, createHash } from "crypto";
import { payments } from "bitcoinjs-lib";
import bs58check from "bs58check";
import { ec as EC } from "elliptic";
import axios from "axios";

// secp256k1 곡선 사용
const ec = new EC("secp256k1");

// SHA-256 해시 함수
function sha256(buffer: Buffer): Buffer {
  return createHash("sha256").update(buffer).digest();
}

// 더블 SHA-256으로 체크섬 계산
function calculateChecksum(buffer: Buffer): Buffer {
  return sha256(sha256(buffer)).slice(0, 4);
}

function privateKeyToWIF(privateKey: Buffer, compressed: boolean = true): string {
  const prefix = Buffer.from([0x80]); // 메인넷 접두사
  const suffix = compressed ? Buffer.from([0x01]) : Buffer.alloc(0);
  const extendedKey = Buffer.concat([prefix, privateKey, suffix]);
  const checksum = calculateChecksum(extendedKey);
  return bs58check.encode(Buffer.concat([extendedKey, checksum]));
}

export async function generateBtcPrivateKey() {
  const privateKey = randomBytes(32);
  const privateKeyHEX = privateKey.toString("hex");

  const wif = privateKeyToWIF(privateKey, true); // true는 압축된 공개 키를 의미

  const keyPair = ec.keyFromPrivate(privateKey);
  const publicKey = Buffer.from(keyPair.getPublic(true, "hex"), "hex");

  const { address: P2PKH } = payments.p2pkh({ pubkey: publicKey });
  const { address: P2WPKH } = payments.p2wpkh({ pubkey: publicKey });

  return { P2PKH, P2WPKH, privateKeyHEX, wif };
}

export async function fetchBtcBalance(address: string): Promise<string> {
  try {
    const url = `https://blockstream.info/api/address/${address}`;
    const { data } = await axios.get(url, { timeout: 15000 });
    const funded: number = data?.chain_stats?.funded_txo_sum ?? 0;
    const spent: number = data?.chain_stats?.spent_txo_sum ?? 0;
    const sats = Math.max(0, funded - spent);
    const btc = sats / 1e8;
    return btc.toString();
  } catch {
    return "N/A";
  }
}

export async function fetchBtcBalances(addresses: string[]): Promise<string[]> {
  return Promise.all(addresses.map((a) => fetchBtcBalance(a)));
}
