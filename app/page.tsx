"use client";

import { generatePrivateKey } from "@/utils/calcBTC";
import { ethers } from "ethers";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiClient } from "@mysten/sui.js/client";
import bs58 from "bs58";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch (e) {
          // no-op
        }
      }}
      className={`btn-ghost text-xs px-2 py-1 ${copied ? "text-emerald-300" : "text-slate-300"}`}
      aria-label="Copy to clipboard"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const Home: NextPage = () => {
  const [keyData, setKeyData] = useState<{ privateKey: string; publicKey: string; balance: string | null }[]>([]);
  const [bitcoinKeyData, setBitcoinKeyData] = useState<any[]>([]);
  const [solanaKeyData, setSolanaKeyData] = useState<
    { privateKey: string; publicKey: string; balance: string | null }[]
  >([]);
  const [network, setNetwork] = useState<"bitcoin" | "ethereum" | "solana" | "sui">("bitcoin");
  const [suiKeyData, setSuiKeyData] = useState<
    { privateKey: string; publicKey: string; balance: string | null }[]
  >([]);
  const [publicKeyType, setPublicKeyType] = useState(0);
  const [privateKeyType, setPrivateKeyType] = useState(0);
  const [loading, setLoading] = useState(false);

  const rpc = process.env.NEXT_PUBLIC_INFURA_ENDPOINT;
  const solRpc = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
  const suiRpc = process.env.NEXT_PUBLIC_SUI_RPC || "https://fullnode.devnet.sui.io";

  const generateData = async () => {
    setLoading(true);
    const generatedKeys: any[] = [];
    setBitcoinKeyData([]);
    for (let i = 0; i < 8; i++) {
      const { P2PKH, P2WPKH, privateKeyHEX, wif }: any = await generatePrivateKey();
      const privateKeyWIF = wif;
      const balance = "0"; // Placeholder; on-chain check omitted
      generatedKeys.push({ privateKeyHEX, privateKeyWIF, P2PKH, P2WPKH, balance });
    }
    setBitcoinKeyData(generatedKeys);
    setLoading(false);
  };

  const generateETHData = async () => {
    setLoading(true);
    const generatedKeys: { privateKey: string; publicKey: string; balance: string | null }[] = [];
    setKeyData([]);
    for (let i = 0; i < 8; i++) {
      const hdNodeWallet = ethers.HDNodeWallet.createRandom();
      const randomWallet = rpc
        ? new ethers.Wallet(hdNodeWallet.privateKey, new ethers.JsonRpcProvider(rpc))
        : new ethers.Wallet(hdNodeWallet.privateKey);
      generatedKeys.push({
        privateKey: randomWallet.privateKey,
        publicKey: randomWallet.address,
        balance: "Loading...",
      });
    }
    setKeyData(generatedKeys);

    if (!rpc) {
      // No provider available; mark balances as N/A gracefully
      setKeyData((prev) => prev.map((k) => ({ ...k, balance: "N/A" })));
      setLoading(false);
      return;
    }

    const provider = new ethers.JsonRpcProvider(rpc);
    generatedKeys.forEach(async (key, index) => {
      try {
        const balance = ethers.formatEther(await provider.getBalance(key.publicKey));
        setKeyData((prevKeys) => prevKeys.map((k, idx) => (idx === index ? { ...k, balance } : k)));
      } catch (error) {
        // Keep it quiet but informative visually below
        setKeyData((prev) => prev.map((k, idx) => (idx === index ? { ...k, balance: "N/A" } : k)));
      } finally {
        setLoading(false);
      }
    });
  };

  const loadDataByState = () => {
    if (network === "bitcoin") return generateData();
    if (network === "ethereum") return generateETHData();
    if (network === "solana") return generateSOLData();
    return generateSUIData();
  };

  const generateSOLData = async () => {
    setLoading(true);
    const generated: { privateKey: string; publicKey: string; balance: string | null }[] = [];
    setSolanaKeyData([]);
    for (let i = 0; i < 8; i++) {
      const kp = Keypair.generate();
      generated.push({
        publicKey: kp.publicKey.toBase58(),
        privateKey: bs58.encode(kp.secretKey),
        balance: "Loading...",
      });
    }
    setSolanaKeyData(generated);

    try {
      const connection = new Connection(solRpc, "confirmed");
      await Promise.all(
        generated.map(async (k, index) => {
          try {
            const lamports = await connection.getBalance(new PublicKey(k.publicKey));
            const balance = (lamports / LAMPORTS_PER_SOL).toString();
            setSolanaKeyData((prev) => prev.map((x, i) => (i === index ? { ...x, balance } : x)));
          } catch (e) {
            setSolanaKeyData((prev) => prev.map((x, i) => (i === index ? { ...x, balance: "N/A" } : x)));
          }
        })
      );
    } catch (e) {
      setSolanaKeyData((prev) => prev.map((x) => ({ ...x, balance: "N/A" })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataByState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const formatSui = (mist: string) => {
    const n = Number(mist) / 1e9;
    if (!isFinite(n)) return "N/A";
    return n.toLocaleString(undefined, { maximumFractionDigits: 9 });
  };

  const generateSUIData = async () => {
    setLoading(true);
    const generated: { privateKey: string; publicKey: string; balance: string | null }[] = [];
    setSuiKeyData([]);
    for (let i = 0; i < 8; i++) {
      const kp = Ed25519Keypair.generate();
      const address = kp.getPublicKey().toSuiAddress();
      const exported = kp.export();
      // exported.privateKey is Sui keystore-compatible base64 (schema flag + secret key)
      generated.push({ publicKey: address, privateKey: exported.privateKey, balance: "Loading..." });
    }
    setSuiKeyData(generated);

    try {
      const client = new SuiClient({ url: suiRpc });
      await Promise.all(
        generated.map(async (k, index) => {
          try {
            const bal = await client.getBalance({ owner: k.publicKey });
            const balance = formatSui(bal.totalBalance);
            setSuiKeyData((prev) => prev.map((x, i) => (i === index ? { ...x, balance } : x)));
          } catch (e) {
            setSuiKeyData((prev) => prev.map((x, i) => (i === index ? { ...x, balance: "N/A" } : x)));
          }
        })
      );
    } catch (e) {
      setSuiKeyData((prev) => prev.map((x) => ({ ...x, balance: "N/A" })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="container-page">
        <div className="mb-6 text-center">
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              Random Private Key Generator
            </span>
          </h1>
          <p className="mt-2 text-slate-400">
            Generate Bitcoin, Ethereum, Solana, or Sui keys instantly. Copy with one click.
          </p>
        </div>

        <section className="card p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="segmented w-full md:w-auto">
              <button
                aria-pressed={network === "bitcoin"}
                className="w-1/3 md:w-auto"
                onClick={() => setNetwork("bitcoin")}
              >
                Bitcoin
              </button>
              <button
                aria-pressed={network === "ethereum"}
                className="w-1/3 md:w-auto"
                onClick={() => setNetwork("ethereum")}
              >
                Ethereum
              </button>
              <button aria-pressed={network === "solana"} className="w-1/4 md:w-auto" onClick={() => setNetwork("solana")}>
                Solana
              </button>
              <button aria-pressed={network === "sui"} className="w-1/4 md:w-auto" onClick={() => setNetwork("sui")}>
                Sui
              </button>
            </div>

            <button onClick={loadDataByState} className="btn-primary w-full md:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 6V3L8 7l4 4V8c2.757 0 5 2.243 5 5a5 5 0 0 1-9.584 2.001 1 1 0 1 0-1.832.998A7 7 0 1 0 12 6Z" />
              </svg>
              Reload
            </button>
          </div>

          {network === "bitcoin" && (
            <div className="mt-12  sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <span className="label w-[90px]">Public Key</span>
                <div className="segmented">
                  <button aria-pressed={publicKeyType === 0} onClick={() => setPublicKeyType(0)}>
                    P2WPKH
                  </button>
                  <button aria-pressed={publicKeyType === 1} onClick={() => setPublicKeyType(1)}>
                    P2PKH
                  </button>
                </div>
              </div>
              <div className="flex mt-2 items-center gap-3">
                <span className="label w-[90px]">Private Key</span>
                <div className="segmented">
                  <button aria-pressed={privateKeyType === 0} onClick={() => setPrivateKeyType(0)}>
                    WIF
                  </button>
                  <button aria-pressed={privateKeyType === 1} onClick={() => setPrivateKeyType(1)}>
                    Hexadecimal
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`s-${i}`} className="card p-4 animate-pulse">
                <div className="mb-2 flex items-center justify-between">
                  <div className="h-4 w-10 rounded bg-white/10" />
                  <div className="h-4 w-10 rounded bg-white/10" />
                </div>
                <div className="field">
                  <div className="field-label">&nbsp;</div>
                  <div className="field-value">
                    <div className="h-3 w-14 rounded bg-white/10 mt-1" />
                    <div className="h-4 flex-1 rounded bg-white/10" />
                  </div>
                </div>
                <div className="field">
                  <div className="field-label">&nbsp;</div>
                  <div className="field-value">
                    <div className="h-3 w-14 rounded bg-white/10 mt-1" />
                    <div className="h-4 flex-1 rounded bg-white/10" />
                  </div>
                </div>
                <div className="field">
                  <div className="field-label">&nbsp;</div>
                  <div className="field-value">
                    <div className="h-3 w-16 rounded bg-white/10 mt-1" />
                    <div className="h-4 w-24 rounded bg-white/10" />
                  </div>
                </div>
              </div>
            ))}

          {!loading &&
            (network === "bitcoin"
              ? bitcoinKeyData.map((key, index) => (
                  <div key={index} className="card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="pill">BTC</span>
                    </div>
                    <div>
                      <div className="field">
                        <div className="field-label">Public</div>
                        <div className="field-value">
                          <div className="codebox">{publicKeyType === 0 ? key.P2WPKH : key.P2PKH}</div>
                          <CopyButton text={publicKeyType === 0 ? key.P2WPKH : key.P2PKH} />
                        </div>
                      </div>
                      <div className="field">
                        <div className="field-label">Private</div>
                        <div className="field-value">
                          <div className="codebox">{privateKeyType === 0 ? key.privateKeyWIF : key.privateKeyHEX}</div>
                          <CopyButton text={privateKeyType === 0 ? key.privateKeyWIF : key.privateKeyHEX} />
                        </div>
                      </div>
                      <div className="field">
                        <div className="field-label">Balance</div>
                        <div className="field-value ">
                          <code className="text-white text-[12px] w-auto px-2 py-1">{key.balance} BTC</code>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : network === "ethereum"
              ? keyData.map((key, index) => (
                  <div key={index} className="card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="pill">ETH</span>
                    </div>
                    <div>
                      <div className="field">
                        <div className="field-label">Public</div>
                        <div className="field-value">
                          <div className="codebox">{key.publicKey}</div>
                          <CopyButton text={key.publicKey} />
                        </div>
                      </div>
                      <div className="field">
                        <div className="field-label">Private</div>
                        <div className="field-value">
                          <div className="codebox">{key.privateKey}</div>
                          <CopyButton text={key.privateKey} />
                        </div>
                      </div>
                      <div className="field">
                        <div className="field-label">Balance</div>
                        <div className="field-value">
                          <code className="text-[12px] text-white w-auto px-2 py-1">{key.balance} ETH</code>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : network === "solana" ? solanaKeyData.map((key, index) => (
                  <div key={index} className="card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="pill">SOL</span>
                    </div>
                    <div>
                      <div className="field">
                        <div className="field-label">Public</div>
                        <div className="field-value">
                          <div className="codebox">{key.publicKey}</div>
                          <CopyButton text={key.publicKey} />
                        </div>
                      </div>
                      <div className="field">
                        <div className="field-label">Private</div>
                        <div className="field-value">
                          <div className="codebox">{key.privateKey}</div>
                          <CopyButton text={key.privateKey} />
                        </div>
                      </div>
                      <div className="field">
                        <div className="field-label">Balance</div>
                        <div className="field-value">
                          <code className="text-[12px] text-white w-auto px-2 py-1">{key.balance} SOL</code>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : suiKeyData.map((key, index) => (
                  <div key={index} className="card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="pill">SUI</span>
                    </div>
                    <div>
                      <div className="field">
                        <div className="field-label">Public</div>
                        <div className="field-value">
                          <div className="codebox">{key.publicKey}</div>
                          <CopyButton text={key.publicKey} />
                        </div>
                      </div>
                      <div className="field">
                        <div className="field-label">Private</div>
                        <div className="field-value">
                          <div className="codebox">{key.privateKey}</div>
                          <CopyButton text={key.privateKey} />
                        </div>
                      </div>
                      <div className="field">
                        <div className="field-label">Balance</div>
                        <div className="field-value">
                          <code className="text-[12px] text-white w-auto px-2 py-1">{key.balance} SUI</code>
                        </div>
                      </div>
                    </div>
                  </div>
                )))}
        </section>
      </div>
    </main>
  );
};

export default Home;
