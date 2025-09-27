"use client";

import { createConfig, http } from "wagmi";
import { cookieStorage, createStorage } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { sepolia } from "wagmi/chains";

// Create config outside of component to prevent re-initialization
export const config = createConfig(
    getDefaultConfig({
        enableFamily: false,
        chains: [sepolia],
        transports: {
            [sepolia.id]: http(),
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