"use client";

import { createConfig, http } from "wagmi";
import { cookieStorage, createStorage } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { sepolia , bscTestnet} from "wagmi/chains";
import { defineChain } from "viem";

// Custom Sepolia chain with Infura RPC and Etherscan block explorer
// const customSepolia = defineChain({
//   ...sepolia,
//   rpcUrls: {
//     default: {
//       http: [`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || 'YOUR_INFURA_PROJECT_ID'}`],
//     },
//     public: {
//       http: [`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || 'YOUR_INFURA_PROJECT_ID'}`],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: 'Etherscan',
//       url: 'https://sepolia.etherscan.io/',
//     },
//   },
// });

const customBscTestnet = defineChain({
  ...bscTestnet,
  rpcUrls: {
    default: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    },
    public: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://testnet.bscscan.com/',
    },
  },
});

// Get WalletConnect Project ID from environment variable
// Required for WalletConnect functionality (mobile wallets, etc.)
// Get your free project ID at: https://cloud.walletconnect.com
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId && typeof window !== 'undefined') {
    console.warn(
        '⚠️ WalletConnect Project ID not found!\n' +
        'WalletConnect features (mobile wallet connections) will not work.\n' +
        'Get your free project ID at: https://cloud.walletconnect.com\n' +
        'Then add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local file'
    );
}

// Create config outside of component to prevent re-initialization
export const config = createConfig(
    getDefaultConfig({
        enableFamily: false,
        chains: [customBscTestnet],
        transports: {
            [customBscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545/'),
        },
        storage: createStorage({
            storage: cookieStorage,
        }),

        // Required API Keys
        // Use empty string if not set - ConnectKit will handle gracefully
        walletConnectProjectId: walletConnectProjectId || "",

        // Required App Info
        appName: "Nova Protocol",

        // Optional App Info
        appDescription: "Autonomous Decentralized on-chain insurance platform",
        // appUrl: "https://family.co", // your app's url
        // appIcon: "https://family.co/logo.png",
    })
);