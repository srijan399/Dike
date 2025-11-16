"use client";

import { useAccount, useBalance } from "wagmi";
import { USDC_BNB_TESTNET_ADDRESS } from "@/app/abi";

/**
 * usePyUsdBalance
 * - Returns the connected wallet's USDC balance on BSC Testnet.
 * - Includes loading state and auto-updates via `watch`.
 */
export default function usePyUsdBalance() {
  const { address } = useAccount();

  const result = useBalance({
    chainId: 97, // BSC Testnet
    address,
    token: USDC_BNB_TESTNET_ADDRESS,
    // Avoid unnecessary calls when no wallet is connected
    // and prevent frequent refetches that cause loading flicker.
    query: {
      enabled: Boolean(address),
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
  });

  return result;
}