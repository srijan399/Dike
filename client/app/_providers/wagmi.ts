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

        walletConnectProjectId:
            process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
            "default_project_id",

        // Required App Info
        appName: "Dike",

        // Optional App Info
        appDescription: "Autonomous Decentralized on-chain insurance platform",
    })
);
