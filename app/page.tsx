"use client";

import { generatePrivateKey } from "@/utils/calcBTC";
import { ethers } from "ethers";
import { NextPage } from "next";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const [keyData, setKeyData] = useState<{ privateKey: string; publicKey: string; balance: string | null }[]>([]);
  const [bitcoinKeyData, setBitcoinKeyData] = useState<any[]>([]);
  const [isBitcoin, setIsBitcoin] = useState(true);
  const [publicKeyType, setPublicKeyType] = useState(0);
  const [privateKeyType, setPrivateKeyType] = useState(0);

  const rpc = process.env.NEXT_PUBLIC_INFURA_ENDPOINT;

  const provider = new ethers.JsonRpcProvider(rpc);

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

  const generateData = async () => {
    const generatedKeys = [];
    setBitcoinKeyData([]);
    for (let i = 0; i < 8; i++) {
      const { P2PKH, P2WPKH, privateKeyHEX, wif }: any = await generatePrivateKey();
      const privateKeyWIF = wif;

      // const balance = await getBitcoinBalance(publicKey);
      const balance = "0";
      generatedKeys.push({ privateKeyHEX, privateKeyWIF, P2PKH, P2WPKH, balance });
    }
    setBitcoinKeyData(generatedKeys);
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
          className={`w-full border border-blue-800  h-10 rounded-lg mb-2 hover:bg-blue-400`}
        >
          Reload
        </button>
        {isBitcoin && (
          <>
            <div className="flex items-center gap-2 h-10 w-full">
              <h1 className="font-bold"> Public Key Type :</h1>
              <button
                onClick={() => setPublicKeyType(0)}
                className={` border border-blue-800 p-1 rounded-lg hover:bg-blue-200 ${
                  publicKeyType == 0 && "bg-blue-400"
                }`}
              >
                P2WPKH
              </button>
              <button
                onClick={() => setPublicKeyType(1)}
                className={` border border-blue-800 p-1 rounded-lg hover:bg-blue-200 ${
                  publicKeyType == 1 && "bg-blue-400"
                }`}
              >
                P2PKH
              </button>
            </div>
            <div className="flex items-center gap-2 h-10 mb-2">
              <h1 className="font-bold"> Private Key Type :</h1>
              <button
                onClick={() => setPrivateKeyType(0)}
                className={` border border-blue-800 p-1 rounded-lg hover:bg-blue-200 ${
                  privateKeyType == 0 && "bg-blue-400"
                }`}
              >
                WIP
              </button>
              <button
                onClick={() => setPrivateKeyType(1)}
                className={` border border-blue-800 p-1 rounded-lg hover:bg-blue-200 ${
                  privateKeyType == 1 && "bg-blue-400"
                }`}
              >
                Hexadecimal
              </button>
            </div>
          </>
        )}

        {isBitcoin
          ? bitcoinKeyData.map((key, index) => (
              <div key={index} className="p-2 border rounded bg-white">
                <div>
                  <span className="font-bold">Public Key : </span>
                  {publicKeyType == 0 ? key.P2WPKH : key.P2PKH}
                </div>
                <div>
                  <span className="font-bold">Private Key : </span>
                  {privateKeyType == 0 ? key.privateKeyWIF : key.privateKeyHEX}
                </div>
                <div>
                  <span className="font-bold">Balance : </span>
                  <span>
                    {key.balance} {isBitcoin ? "BTC" : "ETH"}
                  </span>
                </div>
              </div>
            ))
          : keyData.map((key, index) => (
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
