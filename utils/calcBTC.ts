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

  // 압축된 공개 키를 사용할 경우 개인 키 뒤에 0x01 추가
  const suffix = compressed ? Buffer.from([0x01]) : Buffer.alloc(0);

  // 접두사 + 개인 키 + (압축 여부에 따른 접미사)
  const extendedKey = Buffer.concat([prefix, privateKey, suffix]);

  // 체크섬 추가
  const checksum = calculateChecksum(extendedKey);

  // 최종 WIF: Base58Check 인코딩
  return bs58check.encode(Buffer.concat([extendedKey, checksum]));
}

// 개인 키 생성 함수
export async function generatePrivateKey() {
  // 32바이트(256비트) 개인 키를 무작위로 생성
  const privateKey = randomBytes(32);
  const privateKeyHEX = privateKey.toString("hex");

  const wif = privateKeyToWIF(privateKey, true); // true는 압축된 공개 키를 의미

  // elliptic을 사용해 개인 키로부터 키페어 생성
  const keyPair = ec.keyFromPrivate(privateKey);

  // 공개 키를 압축된 형식으로 가져오기
  const publicKey = Buffer.from(keyPair.getPublic(true, "hex"), "hex");

  // 비트코인 P2PKH 주소 생성
  const { address: P2PKH } = payments.p2pkh({ pubkey: publicKey });

  // 비트코인 P2PKH 주소 생성
  const { address: P2WPKH } = payments.p2wpkh({ pubkey: publicKey });

  return { P2PKH, P2WPKH, privateKeyHEX, wif };
}
