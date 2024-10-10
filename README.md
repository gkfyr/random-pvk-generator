# 🗝️ Random Private Key Generator

This is a web application that allows users to generate random private keys and corresponding public addresses for **Bitcoin** and **Ethereum**. Users can also view their balances (for Ethereum, it queries real-time balances using the Ethereum blockchain). The application uses **BitcoinJS**, **Ethers.js**, and **Elliptic** libraries for cryptographic key generation.

## 🚀 Features

- **Bitcoin and Ethereum Key Generation:**

  - Easily generate random private keys for Bitcoin and Ethereum.
  - Bitcoin private keys can be viewed in WIF (Wallet Import Format) or hexadecimal.
  - Ethereum private keys are displayed in hexadecimal.

- **Public Key Formats for Bitcoin:**

  - Supports both P2PKH (Pay-to-PubKey-Hash) and P2WPKH (Pay-to-Witness-PubKey-Hash) formats for Bitcoin public addresses.

- **Balance Check for Ethereum:**

  - Queries real-time Ethereum balances using the Infura API.
  - Displays the balance in ETH for Ethereum addresses.

- **Dynamic UI:**

  - Toggle between Bitcoin and Ethereum key generation.
  - Choose between different public key and private key formats for Bitcoin.

## 🛠️ Built With

- **Next.js** - React framework for server-side rendering and static site generation.
- **BitcoinJS** - JavaScript library for Bitcoin cryptography and transactions.
- **Ethers.js** - Library for interacting with the Ethereum blockchain.
- **Elliptic** - Elliptic curve cryptography library (secp256k1 for Bitcoin and Ethereum).

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

4. Set up the .env file with your Infura API endpoint:

```bash
NEXT_PUBLIC_INFURA_ENDPOINT=<YOUR_INFURA_ENDPOINT>
```

Replace <YOUR_INFURA_ENDPOINT> with your Infura Project ID.

5. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 to view the app in the browser.

## 📋 Usage

1. Select either **Bitcoin** or **Ethereum** using the toggle buttons.
2. For Bitcoin, you can choose the type of public key (P2PKH or P2WPKH) and private key format (WIF or Hexadecimal).
3. Click the **Reload** button to generate 8 new keys and addresses.
4. If Ethereum is selected, balances for the generated addresses will be fetched automatically.

## 📂 Project Structure

- `pages/` - Contains Next.js pages.
- `components/` - Reusable React components.
- `utils/` - Utility functions such as Bitcoin key generation logic.
- `.env` - Environment variables for API keys.

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 📧 Contact

If you have any questions or feedback, feel free to reach out to me at:

- **GitHub:** https://github.com/gkfyr
- **Email:** hrkairdrop@gmail.com
