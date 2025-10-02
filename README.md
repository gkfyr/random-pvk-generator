# 🗝️ Random Private Key Generator

Generate random wallets and preview balances across multiple chains with a clean, modern UI. Supports Bitcoin, Ethereum, Solana, and Sui. Copy keys with one click and toggle address/format options where relevant.

## 🚀 Features

- Multi‑chain key generation
  - Bitcoin: P2WPKH/P2PKH address toggle; private key in WIF or Hex
  - Ethereum: EOA (secp256k1) private key in Hex (0x‑prefixed)
  - Solana: Keypair with public key Base58, private key Base58 (secretKey)
  - Sui: Ed25519 keypair with keystore‑compatible Base64 private key

- Balance preview (no server)
  - Bitcoin: Blockstream public API (no API key)
  - Ethereum: via JSON‑RPC (Infura or any RPC URL)
  - Solana: via RPC (Devnet default)
  - Sui: via RPC (Devnet default)

- Polished UI/UX
  - Chain segmented control, Reload action, copy buttons
  - Card layout with monospaced code boxes and loading skeletons

## 🛠️ Built With

- Next.js (App Router) + React 18 + Tailwind CSS
- bitcoinjs-lib, elliptic, bs58check
- ethers v6
- @solana/web3.js, bs58
- @mysten/sui.js

## 📦 Installation

To set up this project locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/gkfyr/random-pvk-generator.git
```

2. Navigate to the project folder:

```bash
cd random-pvk-generator
```

3. Install the dependencies:

```bash
npm install
```

4. (Optional) Create `.env` and set RPC endpoints:

```bash
# Ethereum RPC (Infura or any public RPC)
NEXT_PUBLIC_INFURA_ENDPOINT=https://mainnet.infura.io/v3/<PROJECT_ID>

# Solana RPC (defaults to Devnet if not set)
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com

# Sui RPC (defaults to Devnet if not set)
NEXT_PUBLIC_SUI_RPC=https://fullnode.devnet.sui.io
```

Notes:
- If `NEXT_PUBLIC_INFURA_ENDPOINT` is not set, a public fallback is used but balances show as `N/A` if the RPC disallows it.
- Bitcoin balances use Blockstream public API and require no API key.

5. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 to view the app in the browser.

6. Production build (optional):

```bash
npm run build
npm start
```

## 📋 Usage

1. Select a chain: Bitcoin / Ethereum / Solana / Sui
2. Bitcoin only: choose Public (P2WPKH or P2PKH) and Private (WIF or Hex)
3. Click Reload to generate 8 new wallets
4. Balances fetch automatically per chain
   - BTC balance reflects the currently selected public key type
   - SOL/SUI use Devnet by default (adjust RPCs in `.env` as needed)

## 📂 Project Structure

- `app/` — Next.js App Router entry (layout, page)
- `utils/`
  - `btc.ts` — Bitcoin key generation (WIF/Hex) + balance fetch (Blockstream)
  - `eth.ts` — Ethereum key generation + balance fetch
  - `sol.ts` — Solana keypair generation + balance fetch
  - `sui.ts` — Sui keypair generation (Base64 keystore format) + balance fetch
- `.env` — Public RPC endpoints (client-side)

Legacy: `utils/calcBTC.ts` remains for reference; the app uses `utils/btc.ts`.

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 📧 Contact

If you have any questions or feedback, feel free to reach out to me at:

- **GitHub:** https://github.com/gkfyr
- **Email:** hrkairdrop@gmail.com

## ⚠️ Security Notice

- This app reveals generated private keys in the browser for demo/testing. Do not fund these keys in production scenarios.
- Keys are generated client‑side and not stored by the app. Always treat displayed keys as compromised and for testing only.
