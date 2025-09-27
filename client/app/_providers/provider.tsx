"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { WagmiProvider, createConfig, http, cookieStorage, createStorage } from "wagmi";
import { sepolia } from "wagmi/chains";
import { theme } from "../constants/theme";
import { useMemo, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    // Create QueryClient with useState to prevent re-initialization
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                    },
                },
            })
    );

    const wagmiConfig = useMemo(() => (
        createConfig(
            getDefaultConfig({
                enableFamily: false,
                chains: [sepolia],
                transports: {
                    [sepolia.id]: http(),
                },
                storage: createStorage({
                    storage: cookieStorage,
                }),
                walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "default_project_id",
                appName: "Nova Protocol",
                appDescription: "Autonomous Decentralized on-chain insurance platform",
            })
        )
    ), []);

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider
                    customTheme={theme}
                // mode='dark'
                >
                    {children}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}