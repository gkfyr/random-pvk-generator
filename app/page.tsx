"use client";

import { generateBtcPrivateKey } from "@/utils/btc";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { createSolanaKeys, fetchSolBalances } from "@/utils/sol";
import { createSuiKeys, fetchSuiBalances } from "@/utils/sui";
import { createRandomEthKeys, fetchEthBalances } from "@/utils/eth";
import { fetchBtcBalances } from "@/utils/btc";

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
  const [suiKeyData, setSuiKeyData] = useState<{ privateKey: string; publicKey: string; balance: string | null }[]>([]);
  const [publicKeyType, setPublicKeyType] = useState(0);
  const [privateKeyType, setPrivateKeyType] = useState(0);
  const [loading, setLoading] = useState(false);

  const ethRpc = process.env.NEXT_PUBLIC_INFURA_ENDPOINT || "https://eth.drpc.org";
  const solRpc = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
  const suiRpc = process.env.NEXT_PUBLIC_SUI_RPC || "https://fullnode.devnet.sui.io";

  const generateData = async () => {
    setLoading(true);
    const generatedKeys: any[] = [];
    setBitcoinKeyData([]);
    for (let i = 0; i < 8; i++) {
      const { P2PKH, P2WPKH, privateKeyHEX, wif }: any = await generateBtcPrivateKey();
      const privateKeyWIF = wif;
      generatedKeys.push({
        privateKeyHEX,
        privateKeyWIF,
        P2PKH,
        P2WPKH,
        balanceP2WPKH: "Loading...",
        balanceP2PKH: "Loading...",
      });
    }
    setBitcoinKeyData(generatedKeys);

    try {
      const [bW, bP] = await Promise.all([
        fetchBtcBalances(generatedKeys.map((k) => k.P2WPKH)),
        fetchBtcBalances(generatedKeys.map((k) => k.P2PKH)),
      ]);
      setBitcoinKeyData((prev) =>
        prev.map((k, i) => ({ ...k, balanceP2WPKH: bW[i] ?? "N/A", balanceP2PKH: bP[i] ?? "N/A" }))
      );
    } catch (e) {
      setBitcoinKeyData((prev) => prev.map((k) => ({ ...k, balanceP2WPKH: "N/A", balanceP2PKH: "N/A" })));
    } finally {
      setLoading(false);
    }
  };

  const generateETHData = async () => {
    setLoading(true);
    const generatedKeys = createRandomEthKeys(8, ethRpc);
    setKeyData(generatedKeys.map((k) => ({ ...k, balance: "Loading..." })));

    if (!ethRpc) {
      // No provider available; mark balances as N/A gracefully
      setKeyData((prev) => prev.map((k) => ({ ...k, balance: "N/A" })));
      setLoading(false);
      return;
    }

    const balances = await fetchEthBalances(
      ethRpc,
      generatedKeys.map((k) => k.publicKey)
    );
    setKeyData((prev) => prev.map((k, i) => ({ ...k, balance: balances[i] ?? "N/A" })));
    setLoading(false);
  };

  const loadDataByState = () => {
    if (network === "bitcoin") return generateData();
    if (network === "ethereum") return generateETHData();
    if (network === "solana") return generateSOLData();
    return generateSUIData();
  };

  const generateSOLData = async () => {
    setLoading(true);
    const generated = createSolanaKeys(8);
    setSolanaKeyData(generated.map((k) => ({ ...k, balance: "Loading..." })));
    const balances = await fetchSolBalances(
      solRpc,
      generated.map((k) => k.publicKey)
    );
    setSolanaKeyData((prev) => prev.map((k, i) => ({ ...k, balance: balances[i] ?? "N/A" })));
    setLoading(false);
  };

  useEffect(() => {
    loadDataByState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const generateSUIData = async () => {
    setLoading(true);
    const generated = createSuiKeys(8);
    setSuiKeyData(generated.map((k) => ({ ...k, balance: "Loading..." })));
    const balances = await fetchSuiBalances(
      suiRpc,
      generated.map((k) => k.publicKey)
    );
    setSuiKeyData((prev) => prev.map((k, i) => ({ ...k, balance: balances[i] ?? "N/A" })));
    setLoading(false);
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
              <button
                aria-pressed={network === "solana"}
                className="w-1/4 md:w-auto"
                onClick={() => setNetwork("solana")}
              >
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
        </section>
        {network === "bitcoin" && (
          <section className="card p-4 md:p-6 mb-6">
            <div className="flex gap-10 items-center">
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
              <div className="flex items-center gap-3">
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
          </section>
        )}
        <section className="flex flex-col gap-3">
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={`s-${i}`} className="card p-4 animate-pulse">
                <div className="mb-2 flex items-center justify-between">
                  <div className="h-5 w-10 rounded bg-white/10" />
                </div>
                <div className="field">
                  <div className="field-label">
                    <div className="h-3 w-14 rounded bg-white/10" />
                  </div>
                  <div className="field-value">
                    <div className="h-8 w-full rounded-md border border-white/10 bg-white/10" />
                    <div className="h-6 w-12 rounded bg-white/10" />
                  </div>
                </div>
                <div className="field">
                  <div className="field-label">
                    <div className="h-3 w-14 rounded bg-white/10" />
                  </div>
                  <div className="field-value">
                    <div className="h-8 w-full rounded-md border border-white/10 bg-white/10" />
                    <div className="h-6 w-12 rounded bg-white/10" />
                  </div>
                </div>
                <div className="field">
                  <div className="field-label">
                    <div className="h-3 w-16 rounded bg-white/10" />
                  </div>
                  <div className="field-value">
                    <div className="h-6 w-24 rounded bg-white/10" />
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
                          <code className="text-white text-[12px] w-auto px-2 py-1">
                            {(publicKeyType === 0 ? key.balanceP2WPKH : key.balanceP2PKH) ?? key.balance ?? "N/A"} BTC
                          </code>
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
              : network === "solana"
              ? solanaKeyData.map((key, index) => (
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
                ))
              : suiKeyData.map((key, index) => (
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
