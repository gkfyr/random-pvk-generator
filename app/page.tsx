"use client";

import { useState, useEffect } from "react";
import { NextPage } from "next";
import { randomBytes, createHash } from "crypto";
import bs58 from "bs58";
import { ethers } from "ethers";

const Home: NextPage = () => {
  const [keyData, setKeyData] = useState<{ privateKey: string; publicKey: string; balance: string | null }[]>([]);
  const [isBitcoin, setIsBitcoin] = useState(true);
  const rpc = process.env.NEXT_PUBLIC_INFURA_ENDPOINT;

  const provider = new ethers.JsonRpcProvider(rpc);

  // 256비트 무작위 개인 키 생성
  function generatePrivateKey(): Buffer {
    return randomBytes(32); // 32 바이트 = 256비트
  }

  // SHA-256 해시 계산
  function sha256(buffer: Buffer): Buffer {
    return createHash("sha256").update(buffer).digest();
  }

  // WIF 형식으로 변환하는 함수
  function privateKeyToWIF(privateKey: Buffer): string {
    const prefix = Buffer.from([0x80]); // 비트코인의 개인 키는 0x80으로 시작
    const suffix = Buffer.from([0x01]); // 압축된 공개 키를 사용하므로 0x01 추가
    const extendedKey = Buffer.concat([prefix, privateKey, suffix]);

    // 2번 SHA-256을 적용해 체크섬 생성
    const checksum = sha256(sha256(extendedKey)).slice(0, 4);

    // WIF는 개인 키, 압축 여부 및 체크섬을 포함
    const wifKey = Buffer.concat([extendedKey, checksum]);

    // Base58로 인코딩
    return bs58.encode(wifKey);
  }

  // 임의의 비트코인 잔액 생성 함수
  function generateRandomBalance(): string {
    return (Math.random() * 10).toFixed(8); // 0에서 10까지의 무작위 비트코인 잔액 생성
  }

  async function getBitcoinBalance(address: string): Promise<string> {
    try {
      const response = await fetch(`/api/balance?address=${address}`);
      const data = await response.json();
      const balanceInSatoshi = data.balance; // 잔액은 사토시 단위로 반환됨
      const balanceInBTC = (balanceInSatoshi / 100000000).toFixed(8); // 사토시 -> BTC로 변환
      return balanceInBTC;
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "Error";
    }
  }

  // 임의의 공개 키 생성 함수 (간단히 무작위 값을 사용)
  function generateRandomPublicKey(): string {
    return bs58.encode(randomBytes(33)); // 비트코인 공개 키는 일반적으로 33바이트
  }

  const generateData = async () => {
    const generatedKeys = [];
    setKeyData([]);
    for (let i = 0; i < 8; i++) {
      const privateKey = generatePrivateKey();
      const privateKeyWIF = privateKeyToWIF(privateKey);
      const publicKey = generateRandomPublicKey();
      // const balance = await getBitcoinBalance(publicKey);
      const balance = "0";
      generatedKeys.push({ privateKey: privateKeyWIF, publicKey, balance });
    }
    setKeyData(generatedKeys);
  };

  const generateETHData = async () => {
    const generatedKeys = [];
    setKeyData([]);
    for (let i = 0; i < 8; i++) {
      const hdNodeWallet = ethers.HDNodeWallet.createRandom();
      // HD 지갑을 일반 지갑으로 변환
      const randomWallet = new ethers.Wallet(hdNodeWallet.privateKey, provider);

      generatedKeys.push({
        privateKey: randomWallet.privateKey,
        publicKey: randomWallet.address,
        balance: "Loading...",
      });
    }
    setKeyData(generatedKeys);

    generatedKeys.forEach(async (key, index) => {
      try {
        const balance = ethers.formatEther(await provider.getBalance(key.publicKey));
        setKeyData((prevKeys) => prevKeys.map((k, idx) => (idx === index ? { ...k, balance } : k)));
      } catch (error) {
        alert("Too many requests. Please try again 10 minutes later.");
      }
      // 개별 키의 잔고를 업데이트
    });
  };

  const loadDataByState = () => {
    isBitcoin ? generateData() : generateETHData();
  };

  useEffect(() => {
    loadDataByState();
  }, [isBitcoin]);

  return (
    <main>
      <div className="mx-auto w-[800px] bg-blue-300 p-4">
        <header className="text-center text-2xl font-bold mb-4">Random Private Key Generator!</header>
        <div className="w-full flex mb-2 font-bold gap-2">
          <button
            onClick={() => setIsBitcoin(true)}
            className={`w-1/2 border border-blue-800 h-10 rounded-lg ${isBitcoin && "bg-blue-400"}`}
          >
            Bitcoin
          </button>
          <button
            onClick={() => setIsBitcoin(false)}
            className={`w-1/2 border border-blue-800 h-10 rounded-lg ${!isBitcoin && "bg-blue-400"}`}
          >
            Ethereum
          </button>
        </div>
        <button
          onClick={() => loadDataByState()}
          className={`w-full border border-blue-800 h-10 rounded-lg mb-2 hover:bg-blue-400`}
        >
          Reload
        </button>
        {keyData.map((key, index) => (
          <div key={index} className="p-2 border rounded bg-white">
            <div>
              <span className="font-bold">Public Key : </span>
              {key.publicKey}
            </div>
            <div>
              <span className="font-bold">Private Key : </span>
              {key.privateKey}
            </div>
            <div>
              <span className="font-bold">Balance : </span>
              <span>
                {key.balance} {isBitcoin ? "BTC" : "ETH"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Home;
