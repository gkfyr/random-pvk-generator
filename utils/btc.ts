import { randomBytes, createHash } from "crypto";
import { payments } from "bitcoinjs-lib";
import bs58check from "bs58check";
import { ec as EC } from "elliptic";

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
