"use client";

import { createConfig, http } from "wagmi";
import { cookieStorage, createStorage } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { sepolia } from "wagmi/chains";
import { defineChain } from "viem";

// Custom Sepolia chain with Infura RPC and Etherscan block explorer
const customSepolia = defineChain({
  ...sepolia,
  rpcUrls: {
    default: {
      http: [`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || 'YOUR_INFURA_PROJECT_ID'}`],
    },
    public: {
      http: [`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || 'YOUR_INFURA_PROJECT_ID'}`],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io/',
    },
  },
});

// Create config outside of component to prevent re-initialization
export const config = createConfig(
    getDefaultConfig({
        enableFamily: false,
        chains: [customSepolia],
        transports: {
            [customSepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || 'YOUR_INFURA_PROJECT_ID'}`),
        },
        storage: createStorage({
            storage: cookieStorage,
        }),

        // Required API Keys
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "default_project_id",

        // Required App Info
        appName: "Nova Protocol",

        // Optional App Info
        appDescription: "Autonomous Decentralized on-chain insurance platform",
        // appUrl: "https://family.co", // your app's url
        // appIcon: "https://family.co/logo.png",
    })
);