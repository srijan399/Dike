"use client";

import { useAccount, useBalance } from "wagmi";
import { PYUSD_SEPOLIA_ADDRESS } from "@/app/abi";

/**
 * usePyUsdBalance
 * - Returns the connected wallet's PYUSD balance on Sepolia.
 * - Includes loading state and auto-updates via `watch`.
 */
export default function usePyUsdBalance() {
  const { address } = useAccount();

  const result = useBalance({
    chainId: 11155111,
    address,
    token: PYUSD_SEPOLIA_ADDRESS,
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
